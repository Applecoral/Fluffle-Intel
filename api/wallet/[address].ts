import { VercelRequest, VercelResponse } from "@vercel/node";
import { PROTOCOL_REGISTRY, SELECTOR_REGISTRY, getSupabase, getTimeLabel, lookupSelector } from "../../src/server/logic";
import { formatEther } from "viem";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { address } = req.query;
  const walletAddress = (address as string).toLowerCase();

  // 1. Validate
  if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    return res.status(400).json({ error: "Invalid address" });
  }

  const supabase = getSupabase();

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
    const response = await fetch(blockscoutUrl, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    
    if (!response.ok) {
        throw new Error(`Blockscout API responded with ${response.status}`);
    }

    const text = await response.text();
    bsData = JSON.parse(text);

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

    const processedTxs = rawTxs.slice(0, 50);

    for (const bsTx of processedTxs) {
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

      const selector = input.slice(0, 10);
      let action = SELECTOR_REGISTRY[selector];
      
      if (!action && input !== "0x") {
        const signature = await lookupSelector(selector);
        if (signature) {
          action = `called ${signature.split('(')[0]}`;
        } else {
          action = `called function ${selector}`;
        }
      } else if (!action) {
        action = "sent ETH";
      }
      
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

    const topProtocol = Object.entries(protocolCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";
    const dominantCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";
    
    const summary = totalTx === 0 
      ? "No transactions found for this address."
      : `This wallet has made ${totalTx} transactions recently. Most active on ${topProtocol}. Primary behavior: ${dominantCategory}. ${failedTx} failed transactions.`;
    
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
    return res.status(500).json({ error: error.message });
  }
}
