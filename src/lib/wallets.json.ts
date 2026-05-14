import { RAW_1 } from './raw_data_part1';
import { RAW_2 } from './raw_data_part2';
import { RAW_3 } from './raw_data_part3';
import { RAW_4 } from './raw_data_part4';
import { RAW_5 } from './raw_data_part5';

export interface WalletEntry {
  rank: number;
  wallet: string;
  totalPoints: number;
  weeklyPoints: number;
}

// Consolidation of all 1000 wallets exactly as provided
export const WALLET_DATASET: WalletEntry[] = [
  ...RAW_1,
  ...RAW_2,
  ...RAW_3,
  ...RAW_4,
  ...RAW_5
];
