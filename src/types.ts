export interface Protocol {
  name: string;
  slug: string;
  website: string;
  category: string;
  contracts: Record<string, string>;
  verified: boolean;
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
  input?: string;
}

export interface InterpretedTransaction {
  sentence: string;
  time: string;
  protocol: {
    name: string;
    category: string;
    website?: string;
  };
  category: string;
  hash: string;
  failed: boolean;
  valueEth?: string;
  raw?: Transaction;
  blockNumber?: string;
  direction?: string;
  txCategoryLabel?: string;
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
