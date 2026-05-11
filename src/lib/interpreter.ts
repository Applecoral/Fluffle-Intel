import { Transaction, InterpretedTransaction, WalletProfile } from "../types";
import { getProtocol, getAction } from "./registry";

function formatValue(ethValue: number, tokenSymbol = "ETH"): string | null {
  if (ethValue === 0) return null;
  if (ethValue < 0.001) return `<0.001 ${tokenSymbol}`;
  if (ethValue < 1) return `${ethValue.toFixed(4)} ${tokenSymbol}`;
  return `${ethValue.toFixed(2)} ${tokenSymbol}`;
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.max(0, Math.floor(diff / 60000));
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
  const ethValueStr = formatValue(tx.valueEth);
  const time = formatTime(tx.timestamp);
  const failed = !tx.success;
  const prefix = failed ? "[failed] " : "";

  let action = getAction(tx.input || "0x");
  if (tx.categoryLabel === "Transfer") {
    action = tx.direction === "sent" ? "Sent" : "Received";
  } else if (action === "sent ETH" && tx.categoryLabel === "Call") {
    action = "Interacted with";
  }
  
  action = capitalize(action);

  // Interacted with [Protocol Name] — 0.01 ETH — 2d ago
  const sentence = `${prefix}${action} ${protocol.name}${ethValueStr ? ` — ${ethValueStr}` : ""} — ${time}`;

  return {
    sentence,
    time,
    protocol: protocol.name,
    category: protocol.category,
    hash: tx.hash,
    failed,
    valueEth: ethValueStr || undefined,
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

  const sortedProtocols = Object.entries(protocolCounts).sort((a, b) => b[1] - a[1]);
  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  
  const topProtocolEntry = sortedProtocols[0];
  const dominantCategoryEntry = sortedCategories[0];

  const totalTx = transactions.length;
  const failedTx = transactions.filter(t => !t.success).length;

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
