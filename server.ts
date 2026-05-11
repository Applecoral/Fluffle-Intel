import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { createPublicClient, http, hexToNumber, formatEther } from "viem";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// MegaETH RPC Client
const rpcClient = createPublicClient({
  chain: {
    id: 4326,
    name: 'MegaETH Mainnet',
    network: 'megaeth',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://mainnet.megaeth.com/rpc'] }, public: { http: ['https://mainnet.megaeth.com/rpc'] } }
  },
  transport: http()
});

// Registries
const PROTOCOL_REGISTRY: Record<string, { name: string; category: string }> = {
  "0x68b34591f662508076927803c567cc8006988a09": { name: "Kumbaya", category: "swap" },
  "0xf3393dc9e747225fca0d61bfe588ba2838afb077": { name: "Top Strike", category: "game" },
  "0xed62616a7c1dd354801f4e72389299a81493e004": { name: "Prism", category: "liquidity" },
  "0x57020375f4df37012a2f1c765d5a0f9a2bb77996": { name: "Xeet", category: "other" },
  "0x5b424c6ccba77b32b9625a6fd5a30d409d20d997": { name: "Mega Domains", category: "mint" },
  "0x8ca83c6243b7461ae24b5cb167912f5c055f80b0": { name: "GMX", category: "swap" },
  "0x5e3ae52eba0f9740364bd5dd39738e1336086a8b": { name: "World Markets", category: "swap" },
  "0x8aaf217a7a1534327234bd09474fc358e6e4d322": { name: "Showdown TCG", category: "game" },
};

const SELECTOR_REGISTRY: Record<string, string> = {
  "0xa9059cbb": "transferred",
  "0x095ea7b3": "approved",
  "0x23b872dd": "transferred from",
  "0x38ed1739": "swapped exact tokens for tokens",
  "0x7ff36ab5": "swapped exact ETH for tokens",
  "0x18cbafe5": "swapped exact tokens for ETH",
  "0x414bf389": "swapped exact input single",
  "0x5ae401dc": "executed multicall",
  "0xe8e33700": "added liquidity",
  "0xbaa2abde": "removed liquidity",
  "0xa34123a7": "minted liquidity position",
  "0xfc6f7865": "collected fees",
  "0xe8eda9df": "deposited",
  "0x69328dec": "withdrew",
  "0xa415bcad": "borrowed",
  "0x573ade81": "repaid",
  "0x617ba037": "supplied",
  "0xa694fc3a": "staked",
  "0x2e1a7d4d": "unstaked",
  "0x3d18b912": "claimed rewards",
  "0x40c10f19": "minted",
  "0x1249c58b": "minted NFT",
  "0xd0e30db0": "deposited ETH",
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // GET /api/wallet/:address
  app.get("/api/wallet/:address", async (req, res) => {
    const { address } = req.params;
    const walletAddress = address.toLowerCase();

    // 1. Validate
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({ error: "Invalid address" });
    }

    try {
      // 2. Check cache
      if (supabase) {
        const { data: cachedData, error: cacheError } = await supabase
          .from("wallet_cache")
          .select("data, expires_at")
          .eq("wallet_address", walletAddress)
          .single();

        if (cachedData && !cacheError) {
          if (new Date(cachedData.expires_at) > new Date()) {
            return res.json({ ...cachedData.data, cached: true });
          } else {
            // Expired, delete it
            await supabase.from("wallet_cache").delete().eq("wallet_address", walletAddress);
          }
        }
      }

      // 3. Fetch live data
      const latestBlock = await rpcClient.getBlockNumber();
      const transactions = [];
      let totalTx = 0;
      let failedTx = 0;
      const protocolCounts: Record<string, number> = {};
      const categoryCounts: Record<string, number> = {};

      // Scan last 50 blocks
      const startBlock = latestBlock - 50n > 0n ? latestBlock - 50n : 0n;
      
      // For efficiency in this limited environment, we'll fetch blocks in parallel
      // but keep it reasonable to avoid rate limits
      const blockPromises = [];
      for (let i = latestBlock; i >= startBlock; i--) {
        blockPromises.push(rpcClient.getBlock({ blockNumber: i, includeTransactions: true }));
      }
      
      const blocks = await Promise.all(blockPromises);

      for (const block of blocks) {
        const blockTxs = block.transactions as any[];
        for (const tx of blockTxs) {
          if (tx.from?.toLowerCase() === walletAddress || tx.to?.toLowerCase() === walletAddress) {
            totalTx++;
            
            // Get receipt for status
            const receipt = await rpcClient.getTransactionReceipt({ hash: tx.hash });
            const isFailed = receipt.status === 'reverted';
            if (isFailed) failedTx++;

            // Decode
            const selector = tx.input?.slice(0, 10);
            const action = SELECTOR_REGISTRY[selector] || (tx.input && tx.input !== '0x' ? `called function ${selector}` : "sent ETH");
            const protocolInfo = PROTOCOL_REGISTRY[tx.to?.toLowerCase() || ""];
            const protocolName = protocolInfo?.name || (tx.to ? `Unknown protocol (${tx.to.slice(0, 6)}...${tx.to.slice(-4)})` : "N/A");
            const category = protocolInfo?.category || "other";
            
            protocolCounts[protocolName] = (protocolCounts[protocolName] || 0) + 1;
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;

            const valueStr = tx.value && tx.value > 0n ? ` — ${formatEther(tx.value)} ETH` : "";
            const sentence = `${isFailed ? "[failed] " : ""}${action.charAt(0).toUpperCase() + action.slice(1)} on ${protocolName}${valueStr}`;

            transactions.push({
              sentence,
              time: "recent", // Simplified for now
              protocol: protocolName,
              category,
              hash: tx.hash,
              failed: isFailed
            });
          }
        }
      }

      // 5. Generate summary
      const topProtocol = Object.entries(protocolCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";
      const dominantCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";
      
      const summary = totalTx === 0 
        ? "No transactions found in the last 50 blocks."
        : `This wallet has made ${totalTx} transactions in the last 50 blocks. Most activity is on ${topProtocol}. Primary behavior: ${dominantCategory}. ${failedTx} failed transactions.`;

      const responseData = {
        address: walletAddress,
        summary,
        totalTx,
        failedTx,
        topProtocol,
        dominantCategory,
        recentActivity: transactions,
        timestamp: new Date().toISOString(),
        cached: false
      };

      // 6. Cache result
      if (supabase) {
        await supabase.from("wallet_cache").upsert({
          wallet_address: walletAddress,
          data: responseData,
          cached_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        });
      }

      return res.json(responseData);

    } catch (error: any) {
      console.error("Failed to fetch wallet data:", error);
      return res.status(500).json({ error: "Failed to fetch transactions", details: error.message });
    }
  });

  // Cron cleanup endpoints
  app.get("/api/cleanup", async (req, res) => {
    const cronSecret = req.headers["x-cron-secret"];
    if (cronSecret !== process.env.CRON_SECRET) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

    try {
      const { data, error } = await supabase.rpc("cleanup_expired_cache");
      if (error) throw error;
      res.json({ ok: true, deleted: data });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/wipe", async (req, res) => {
    const cronSecret = req.headers["x-cron-secret"];
    if (cronSecret !== process.env.CRON_SECRET) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

    try {
      const { data, error } = await supabase.rpc("wipe_cache_older_than", { days: 14 });
      if (error) throw error;
      res.json({ wiped: true, deleted: data });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Keep existing proxy routes for other features if any
  app.get("/api/terminal-proxy/leaderboard", async (req, res) => {
    const { limit = 100, offset = 0 } = req.query;
    const targetUrl = `https://terminal.megaeth.com/api/v1/leaderboard?limit=${limit}&offset=${offset}`;

    try {
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      if (response.status === 404) return res.json({ users: [], status: "not_available" });
      if (!response.ok) throw new Error(`Terminal API responded with ${response.status}`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Leaderboard Proxy error:", error);
      res.status(500).json({ error: "Failed to fetch from MegaETH leaderboard" });
    }
  });

  app.get("/api/terminal-proxy/user/:address", async (req, res) => {
    const { address } = req.params;
    const targetUrl = `https://terminal.megaeth.com/api/v1/user/${address}`;
    try {
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      if (response.status === 404) return res.json({ status: "not_found" });
      if (!response.ok) throw new Error(`Terminal API responded with ${response.status}`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("User Proxy error:", error);
      res.status(500).json({ error: "Failed to fetch user data" });
    }
  });

  app.get("/api/miniblocks-proxy/address/:address/transactions", async (req, res) => {
    const { address } = req.params;
    const targetUrl = `https://miniblocks.io/api/address/${address}/transactions`;
    try {
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      if (!response.ok) throw new Error(`Miniblocks API responded with ${response.status}`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Miniblocks Proxy error:", error);
      res.status(500).json({ error: "Failed to fetch transactions from Miniblocks" });
    }
  });

  app.get("/api/megaeth-proxy", async (req, res) => {
    const query = req.url.split('?')[1];
    const targetUrl = `https://mega.etherscan.io/api?${query}`;
    try {
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      if (!response.ok) throw new Error(`Etherscan API responded with ${response.status}`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Etherscan Proxy error:", error);
      res.status(500).json({ error: "Failed to fetch from Etherscan" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
