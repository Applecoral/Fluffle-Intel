import { RAW_1 } from './raw_data_part1';
import { RAW_2 } from './raw_data_part2';
import { RAW_3 } from './raw_data_part3';
import { RAW_4 } from './raw_data_part4';
import { RAW_5 } from './raw_data_part5';
import { RAW_6 } from './raw_data_part6';
import { RAW_7 } from './raw_data_part7';

export interface WalletEntry {
  rank: number;
  wallet: string;
  totalPoints: number;
  weeklyPoints: number;
}

const consolidated: WalletEntry[] = [
  ...RAW_1,
  ...RAW_2,
  ...RAW_3,
  ...RAW_4,
  ...RAW_5,
  ...RAW_6,
  ...RAW_7
];

// Deduplicate wallets (if any duplicates exist in the raw data chunks)
const seen = new Set<string>();
const unique: WalletEntry[] = [];
for (const entry of consolidated) {
  if (!seen.has(entry.wallet)) {
    unique.push(entry);
    seen.add(entry.wallet);
  }
}

// Sort by totalPoints descending
const sorted = unique.sort((a, b) => {
  if (b.totalPoints !== a.totalPoints) {
    return b.totalPoints - a.totalPoints;
  }
  return b.weeklyPoints - a.weeklyPoints;
});

// Re-rank to ensure rank 1 is highest points
export const WALLET_DATASET = sorted.map((item, index) => ({
  ...item,
  rank: index + 1
}));
