import { Transaction, InterpretedTransaction, WalletProfile } from "../types";
import { getProtocol, getAction } from "./registry";

function formatValue(weiValue: string, tokenSymbol = "ETH"): string | null {
  const val = parseFloat(weiValue) / 1e18;
  if (val === 0) return null;
  if (val < 0.001) return `<0.001 ${tokenSymbol}`;
  if (val < 1) return `${val.toFixed(4)} ${tokenSymbol}`;
  return `${val.toFixed(2)} ${tokenSymbol}`;
}

function formatTime(timestamp: string): string {
  const date = new Date(parseInt(timestamp) * 1000);
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function interpretTransaction(tx: Transaction): InterpretedTransaction {
  const protocol = getProtocol(tx.to);
  const action = getAction(tx.input);
  const ethValue = formatValue(tx.value);
  const time = formatTime(tx.timeStamp);
  const failed = tx.isError === "1";
  const prefix = failed ? "[failed] " : "";

  // Simplified lookup-based decoding as requested
  const sentence = `${prefix}${action} ${protocol.name}${ethValue ? ` (${ethValue})` : ""}`;

  return {
    sentence,
    time,
    protocol: protocol.name,
    category: protocol.category,
    hash: tx.hash,
    failed,
    valueEth: ethValue || undefined,
    raw: tx
  };
}

export function summarizeWallet(address: string, transactions: Transaction[], rank: number, points: number, weeklyPoints: number): WalletProfile {
  const interpreted = transactions.map(interpretTransaction);
  
  const protocolCounts: Record<string, number> = {};
  interpreted.forEach(t => {
    if (!protocolCounts[t.protocol]) protocolCounts[t.protocol] = 0;
    protocolCounts[t.protocol]++;
  });

  const categoryCounts: Record<string, number> = {};
  interpreted.forEach(t => {
    if (!categoryCounts[t.category]) categoryCounts[t.category] = 0;
    categoryCounts[t.category]++;
  });

  const topProtocolEntry = Object.entries(protocolCounts).sort((a, b) => b[1] - a[1])[0];
  const dominantCategoryEntry = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

  const totalTx = transactions.length;
  const failedTx = transactions.filter(t => t.isError === "1").length;

  const summary = [
    `This wallet has made ${totalTx} transactions on MegaETH.`,
    topProtocolEntry ? `Most activity is on ${topProtocolEntry[0]} (${topProtocolEntry[1]} interactions).` : "",
    dominantCategoryEntry ? `Primary behavior: ${dominantCategoryEntry[0]}.` : "",
    failedTx > 0 ? `${failedTx} failed transaction${failedTx > 1 ? "s" : ""}.` : "",
  ].filter(Boolean).join(" ");

  return {
    address,
    rank,
    allTimePoints: points,
    weeklyPoints,
    lastUpdated: new Date().toISOString(),
    transactions,
    interpretedTransactions: interpreted,
    topProtocol: topProtocolEntry?.[0] || "Unknown",
    dominantCategory: dominantCategoryEntry?.[0] || "unknown",
    summary
  };
}
