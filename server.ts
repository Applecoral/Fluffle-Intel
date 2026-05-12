import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { formatEther } from "viem";
import dotenv from "dotenv";
import { PROTOCOL_REGISTRY, SELECTOR_REGISTRY, getSupabase, getTimeLabel } from "./src/server/logic";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabase = getSupabase();

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

      // 3. Fetch live data from Blockscout MegaETH API
      const blockscoutUrl = `https://megaeth.blockscout.com/api?module=account&action=txlist&address=${walletAddress}&sort=desc&page=1&offset=50`;
      
      let bsData;
      try {
        const response = await fetch(blockscoutUrl, {
          headers: {
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          }
        });
        
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Blockscout API responded with ${response.status}: ${text.slice(0, 100)}`);
        }

        const text = await response.text();
        try {
          bsData = JSON.parse(text);
        } catch (e) {
          throw new Error(`Invalid JSON response from Blockscout: ${text.slice(0, 100)}`);
        }
      } catch (innerError: any) {
        throw new Error(`Connection to Blockscout failed: ${innerError.message}`);
      }

      // Handle "No transactions found"
      if (bsData.status === "0" && bsData.message === "No transactions found") {
        const emptyResponse = {
          address: walletAddress,
          summary: "No transactions found for this address.",
          totalTx: 0,
          failedTx: 0,
          topProtocol: "None",
          dominantCategory: "None",
          recentActivity: [],
          timestamp: new Date().toISOString(),
          cached: false
        };

        // Cache empty result too
        if (supabase) {
          await supabase.from("wallet_cache").upsert({
            wallet_address: walletAddress,
            data: emptyResponse,
            cached_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
          });
        }

        return res.json(emptyResponse);
      }

      if (bsData.status !== "1") {
        throw new Error(bsData.message || "Failed to fetch from Blockscout");
      }

      const rawTxs = bsData.result || [];
      const transactions = [];
      let totalTx = 0;
      let failedTx = 0;
      const protocolCounts: Record<string, number> = {};
      const categoryCounts: Record<string, number> = {};

      // Limit to last 50 transactions
      const processedTxs = rawTxs.slice(0, 50);

      for (const bsTx of processedTxs) {
        // Map according to user request
        const txHash = bsTx.hash;
        const blockNumber = bsTx.blockNumber;
        const fromAddress = bsTx.from;
        const toAddressRaw = bsTx.to;
        const valueWei = bsTx.value;
        const input = bsTx.input || "0x";
        const success = bsTx.txreceipt_status === "1";
        const isFailed = !success;
        if (isFailed) failedTx++;
        totalTx++;

        // Existing decoding logic using mapped fields
        const selector = input.slice(0, 10);
        const action = SELECTOR_REGISTRY[selector] || (input !== "0x" ? `called function ${selector}` : "sent ETH");
        
        const toAddress = (toAddressRaw || "").toLowerCase();
        const protocolInfo = PROTOCOL_REGISTRY[toAddress];
        const protocolName = protocolInfo?.name || (toAddress ? `Unknown protocol (${toAddress.slice(0, 6)}...${toAddress.slice(-4)})` : "N/A");
        const category = protocolInfo?.category || "other";
        
        protocolCounts[protocolName] = (protocolCounts[protocolName] || 0) + 1;
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;

        const val = valueWei ? BigInt(valueWei) : 0n;
        const valueStr = val > 0n ? ` — ${formatEther(val)} ETH` : "";
        const sentence = `${isFailed ? "[failed] " : ""}${action.charAt(0).toUpperCase() + action.slice(1)} on ${protocolName}${valueStr}`;

        transactions.push({
          sentence,
          time: getTimeLabel(Number(bsTx.timeStamp)),
          protocol: protocolName,
          category,
          hash: txHash,
          failed: isFailed,
          blockNumber,
          direction: fromAddress.toLowerCase() === walletAddress ? "sent" : "received",
          txCategoryLabel: (toAddressRaw && input !== "0x") ? "Call" : "Transfer"
        });
      }

      // 5. Generate summary
      const topProtocol = Object.entries(protocolCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";
      const dominantCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";
      
      const summary = totalTx === 0 
        ? "No transactions found for this address."
        : `This wallet has made ${totalTx} transactions recently. Most activity is on ${topProtocol}. Primary behavior: ${dominantCategory}. ${failedTx} failed transactions.`;

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

