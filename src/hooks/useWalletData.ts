import { useState, useEffect } from 'react';

export interface Transaction {
  sentence: string;
  time: string;
  protocol: string;
  category: string;
  hash: string;
  failed: boolean;
}

export interface WalletData {
  address: string;
  summary: string;
  totalTx: number;
  failedTx: number;
  topProtocol: string;
  dominantCategory: string;
  recentActivity: Transaction[];
  timestamp: string;
  cached: boolean;
}

export function useWalletData(address: string | null) {
  const [data, setData] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setData(null);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/wallet/${address}`);
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to fetch wallet data');
        }
        const json = await response.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [address]);

  return { data, isLoading, error };
}
