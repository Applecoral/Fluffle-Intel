import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Panel, Badge, BunnyLogo, TacticalButton } from "./ui/Tactical";
import { PERFORMANCE_MATRIX } from "../lib/data";
import { TrendingUp, Users, Activity, Search, ArrowRight, ShieldCheck, Cpu } from "lucide-react";
import { publicClient } from "../lib/web3";

interface DashboardProps {
  onSelectWallet?: (address: string, rank: number) => void;
}

export function Dashboard({ onSelectWallet }: DashboardProps) {
  const [address, setAddress] = useState("");
  const [blockNumber, setBlockNumber] = useState<bigint | null>(null);
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    let unwatch: (() => void) | undefined;
    
    async function startWatching() {
      try {
        const latest = await publicClient.getBlockNumber();
        setBlockNumber(latest);
        setIsSyncing(false);

        unwatch = publicClient.watchBlockNumber({
          onBlockNumber: (num) => setBlockNumber(num),
        });
      } catch (e) {
        console.error("Failed to sync with MegaETH:", e);
      }
    }

    startWatching();
    return () => unwatch?.();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (address && address.startsWith("0x")) {
      onSelectWallet?.(address, 0);
    }
  };

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col md:flex-row justify-between items-start border-b border-white/5 pb-12 relative gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-blue-500 bg-blue-500/10 px-3 py-1 border border-blue-500/20">MegaETH Mainnet</span>
          </div>
          <h1 className="text-8xl font-black tracking-tighter uppercase mb-2">
            Fluffle Intel
          </h1>
          <div className="flex gap-12 items-start mt-4">
            <p className="max-w-xl text-neutral-400 font-medium leading-relaxed">
              Real-time monitoring and intel for the MegaETH terminal farming.
            </p>
          </div>
        </div>

        <div className="w-full md:w-96">
           <form onSubmit={handleSearch} className="flex flex-col gap-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600">Analyze Wallet Address</span>
              <div className="relative group">
                 <input 
                    type="text" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="0x..." 
                    className="w-full bg-[#0a0a0a] border border-white/10 px-6 py-4 text-sm font-mono focus:outline-none focus:border-blue-500 transition-all placeholder:text-neutral-700"
                 />
                 <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-blue-500 transition-colors">
                    <ArrowRight size={18} />
                 </button>
              </div>
              <div className="flex items-center gap-2 text-[9px] text-neutral-600 font-bold uppercase tracking-widest px-2">
                 <Activity size={10} className="text-blue-500/50" />
                 Live transaction decoding enabled
              </div>
           </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Panel title="Current Progress" className="bg-white/5">
           <div className="space-y-8">
              <div className="flex gap-6">
                 <div className="text-8xl font-black text-white/5 tracking-tighter leading-none italic font-serif">
                    S1
                 </div>
                 <div className="flex flex-col justify-center">
                    <h3 className="text-xl font-bold uppercase tracking-tighter text-white">Season 1: Alpha</h3>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">Ends: June 23</p>
                 </div>
              </div>
              
              <div className="p-6 border border-white/5 bg-black/40">
                 <p className="text-sm text-neutral-400 leading-relaxed uppercase tracking-widest text-[9px]">
                    Analysis of the MegaETH frontier using real-time data ingestion. 
                    Search a wallet to begin decoding.
                 </p>
              </div>
           </div>
        </Panel>
      </div>
    </div>
  );
}
