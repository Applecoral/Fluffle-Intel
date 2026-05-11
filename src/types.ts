export interface Protocol {
  name: string;
  category: "bridge" | "swap" | "lend" | "liquidity" | "mint" | "stake" | "game" | "other" | "unknown";
  isTerminalApproved?: boolean;
}

export interface Token {
  symbol: string;
  decimals: number;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  valueEth: number;
  timestamp: string;
  success: boolean;
  categoryLabel: string;
  direction: string;
}

export interface InterpretedTransaction {
  sentence: string;
  time: string;
  protocol: string;
  category: string;
  hash: string;
  failed: boolean;
  valueEth?: string;
  raw: Transaction;
}

export interface WalletProfile {
  address: string;
  ens?: string;
  rank: number;
  allTimePoints: number;
  weeklyPoints: number;
  lastUpdated: string;
  transactions: Transaction[];
  interpretedTransactions: InterpretedTransaction[];
  topProtocol: string;
  dominantCategory: string;
  summary: string;
}

export interface LeaderboardEntry {
  address: string;
  rank: number;
  allTimePoints: number;
  weeklyPoints: number;
  topProtocol: string;
}

export interface StrategyStats {
  protocolName: string;
  category: string;
  usageCount: number;
  percentage: number;
  isTrending: boolean;
}
