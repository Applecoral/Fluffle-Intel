import { Transaction, WalletProfile } from "../types";
import { LEADERBOARD_DATA } from "../lib/data";
import { interpretTransaction, summarizeWallet } from "../lib/interpreter";
import { getProtocol } from "../lib/registry";

const EXPLORER_API_URL = "/api/megaeth-proxy";
const TERMINAL_API_URL = "/api/terminal-proxy";
const MINIBLOCKS_API_URL = "/api/miniblocks-proxy";

export interface PointsData {
  allTimePoints: number;
  weeklyPoints: number;
  rank: number;
  topProtocol: string;
}

/**
 * Fetches the recent transactions from Miniblocks API for a given wallet address on MegaETH.
 */
export async function fetchWalletTransactions(address: string): Promise<Transaction[]> {
  try {
    // Primary source: Miniblocks
    let response = await fetch(`${MINIBLOCKS_API_URL}/address/${address}/transactions`);
    let data;
    
    if (response.ok) {
        data = await response.json();
    } else {
        // Fallback to Etherscan proxy
        console.warn(`Miniblocks failed, trying Etherscan fallback for ${address}`);
        const etherscanUrl = `${EXPLORER_API_URL}?module=account&action=txlist&address=${address.toLowerCase()}&sort=desc&offset=50&page=1`;
        response = await fetch(etherscanUrl);
        if (response.ok) {
            data = await response.json();
        }
    }

    if (!data) return [];
    
    const txArray = Array.isArray(data) ? data : (data.transactions || data.data || data.result || []);

    if (Array.isArray(txArray)) {
      return txArray.map((tx: any) => ({
        hash: tx.txHash || tx.hash || "",
        from: tx.fromAddress || tx.from || "",
        to: tx.toAddress || tx.to || "",
        valueEth: tx.valueEth || (tx.value ? Number(tx.value) / 1e18 : 0),
        timestamp: tx.timestamp || tx.timeStamp || new Date().toISOString(),
        success: tx.success !== undefined ? tx.success : (tx.isError === "0" || tx.status === "1"),
        categoryLabel: tx.txCategoryLabel || tx.category || tx.functionName?.split("(")[0] || "Call",
        direction: tx.direction || (tx.from?.toLowerCase() === address.toLowerCase() ? "sent" : "received"),
        input: tx.input || tx.data || tx.methodId || "0x"
      }));
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return [];
  }
}

/**
 * Fetches the live leaderboard from MegaETH Terminal.
 */
export async function fetchLeaderboard(limit = 100, offset = 0): Promise<any[]> {
  try {
    const response = await fetch(`${TERMINAL_API_URL}/leaderboard?limit=${limit}&offset=${offset}`);
    if (response.ok) {
        const data = await response.json();
        return data.users || data.data || data; // Handle different potential formats
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    return [];
  }
}

/**
 * Fetches real-time points data from MegaETH Terminal API (or fallback to estimates).
 */
export async function fetchWalletPoints(address: string): Promise<PointsData> {
  // Check static leaderboard first
  const staticEntry = LEADERBOARD_DATA.find(e => e.address.toLowerCase() === address.toLowerCase());
  
  try {
    // ALWAYS attempt to fetch from terminal API for live data
    const response = await fetch(`${TERMINAL_API_URL}/user/${address}`);
    if (response.ok) {
        const data = await response.json();
        if (data && data.status !== "not_found") {
            return {
                allTimePoints: data.points || (staticEntry?.allTimePoints ?? 0),
                weeklyPoints: data.weekly_points || (staticEntry?.weeklyPoints ?? 0),
                rank: data.rank || (staticEntry?.rank ?? 0),
                topProtocol: data.top_protocol || (staticEntry?.topProtocol !== "Pending" ? (staticEntry?.topProtocol || "Unknown") : "Unknown")
            };
        }
    }
    
    // Fallback if not found in live API
    if (staticEntry) {
      return {
        allTimePoints: staticEntry.allTimePoints,
        weeklyPoints: staticEntry.weeklyPoints,
        rank: staticEntry.rank,
        topProtocol: staticEntry.topProtocol
      };
    }

    // Secondary fallback: estimate points based on transaction count
    const txs = await fetchWalletTransactions(address);
    const score = txs.length * 12;
    return {
        allTimePoints: score,
        weeklyPoints: Math.floor(score * 0.1),
        rank: 0,
        topProtocol: txs.length > 0 ? getProtocol(txs[0].to).name : "Inactive"
    };
  } catch (error) {
    if (staticEntry) {
        return {
            allTimePoints: staticEntry.allTimePoints,
            weeklyPoints: staticEntry.weeklyPoints,
            rank: staticEntry.rank,
            topProtocol: staticEntry.topProtocol
        };
    }
    return { allTimePoints: 0, weeklyPoints: 0, rank: 0, topProtocol: "Unknown" };
  }
}

/**
 * Interprets a wallet's on-chain behavior in real-time.
 */
export async function getLiveWalletProfile(address: string, rank: number): Promise<WalletProfile | null> {
  const [transactions, pointsData] = await Promise.all([
    fetchWalletTransactions(address),
    fetchWalletPoints(address)
  ]);
  
  const profile = summarizeWallet(
    address, 
    transactions, 
    rank || pointsData.rank, 
    pointsData.allTimePoints, 
    pointsData.weeklyPoints
  );

  return {
      ...profile,
      topProtocol: pointsData.topProtocol || profile.topProtocol
  };
}
