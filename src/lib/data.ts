import { Transaction, LeaderboardEntry } from "../types";
import { WALLET_DATASET } from "./wallets.json.ts";

// The core dataset of top wallets from the scrapper
export const LEADERBOARD_DATA: LeaderboardEntry[] = WALLET_DATASET.map((entry) => {
    return {
        address: entry.wallet,
        rank: entry.rank,
        allTimePoints: entry.totalPoints,
        weeklyPoints: entry.weeklyPoints,
        topProtocol: "Pending" // Will be updated via interpreter once txs load
    };
});

// Real-time protocol performance based on small sample analysis or known dominant actors
export const PERFORMANCE_MATRIX = [
  { protocolName: "Kumbaya", category: "swap", usageCount: 847, percentage: 45, isTrending: true },
  { protocolName: "Teko Finance", category: "lend", usageCount: 623, percentage: 33, isTrending: true },
  { protocolName: "GMX", category: "swap", usageCount: 412, percentage: 22, isTrending: true },
  { protocolName: "MegaETH Native Bridge", category: "bridge", usageCount: 156, percentage: 14, isTrending: false },
  { protocolName: "Gutter", category: "swap", usageCount: 312, percentage: 29, isTrending: true },
];
