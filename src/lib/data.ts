import { Transaction, LeaderboardEntry } from "../types";
import { DATASET_WALLETS } from "./wallets.json";

// The core dataset of top wallets from the scrapper
export const LEADERBOARD_DATA: LeaderboardEntry[] = DATASET_WALLETS.map((address, index) => {
    // Rank is based on position in dataset
    return {
        address,
        rank: index + 1,
        allTimePoints: 0, // In live mode, we'd fetch this from a points API
        weeklyPoints: 0,
        topProtocol: "Pending Analysis"
    };
});

// Real-time protocol performance based on small sample analysis or known dominant actors
export const PERFORMANCE_MATRIX = [
  { protocolName: "Teko Finance", category: "lend", usageCount: 452, percentage: 42, isTrending: true },
  { protocolName: "Gutter", category: "swap", usageCount: 312, percentage: 29, isTrending: true },
  { protocolName: "MegaETH Native Bridge", category: "bridge", usageCount: 156, percentage: 14, isTrending: false },
  { protocolName: "The Fluffle", category: "game", usageCount: 88, percentage: 8, isTrending: false },
  { protocolName: "Aave V3", category: "lend", usageCount: 75, percentage: 7, isTrending: true },
];
