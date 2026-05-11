import { useState, useEffect, FormEvent } from "react";
import { motion } from "motion/react";
import { Panel, Badge, BunnyLogo, TacticalButton } from "./ui/Tactical";
import { PERFORMANCE_MATRIX } from "../lib/data";
import { TrendingUp, Users, Activity, Search, ArrowRight, ShieldCheck, Cpu, Copy, Check } from "lucide-react";
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

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const cleanAddress = address.trim();
    if (/^0x[a-fA-F0-9]{40}$/.test(cleanAddress)) {
      onSelectWallet?.(cleanAddress, 0);
    } else {
      alert("Please enter a valid 0x wallet address (42 characters)");
    }
  };

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col xl:flex-row justify-between items-start border-b border-black/5 dark:border-white/5 pb-12 relative gap-8 transition-colors">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-blue-600 dark:text-blue-500 bg-blue-500/10 px-3 py-1 border border-blue-500/20">MegaETH Mainnet</span>
          </div>
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter uppercase mb-2 text-black dark:text-white">
            Fluffle Intel
          </h1>
          <div className="flex gap-12 items-start mt-4">
            <p className="max-w-xl text-sm md:text-base text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed uppercase tracking-wide">
              Real-time monitoring and intel for the MegaETH terminal farming.
            </p>
          </div>
        </div>

        <div className="w-full xl:w-96">
           <form onSubmit={handleSearch} className="flex flex-col gap-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-600">Analyze Wallet Address</span>
              <div className="relative group">
                  <input 
                     type="text" 
                     value={address}
                     onChange={(e) => setAddress(e.target.value)}
                     placeholder="0x..." 
                     className="w-full bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 px-6 py-4 pr-24 text-sm font-mono focus:outline-none focus:border-blue-500 transition-all placeholder:text-neutral-500 dark:placeholder:text-neutral-700 text-black dark:text-white shadow-sm dark:shadow-none"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                     {address && (
                        <button 
                           type="button"
                           onClick={() => navigator.clipboard.writeText(address)}
                           className="text-neutral-600 dark:text-neutral-600 hover:text-blue-600 dark:hover:text-blue-500 transition-colors"
                        >
                           <Copy size={16} />
                        </button>
                     )}
                     <button type="submit" className="text-neutral-600 dark:text-neutral-600 hover:text-blue-600 dark:hover:text-blue-500 transition-colors">
                        <ArrowRight size={18} />
                     </button>
                  </div>
               </div>
              <div className="flex items-center gap-2 text-[9px] text-neutral-600 dark:text-neutral-600 font-bold uppercase tracking-widest px-2">
                 <Activity size={10} className="text-blue-600 dark:text-blue-500" />
                 Live transaction decoding enabled
              </div>
           </form>

           <div className="mt-10 pt-10 border-t border-black/10 dark:border-white/5 space-y-5 transition-colors">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-500 flex items-center gap-2">
                  <TrendingUp size={12} className="animate-pulse" /> Live Network Intel
                </span>
                {blockNumber && (
                  <span className="text-[9px] font-mono text-neutral-400 dark:text-neutral-600">
                    BLK #{blockNumber.toString()}
                  </span>
                )}
              </div>
              <div className="bg-white dark:bg-black/40 border border-black/10 dark:border-white/5 p-5 relative overflow-hidden shadow-sm dark:shadow-none transition-colors group">
                <div className="text-[10px] uppercase font-bold tracking-widest leading-relaxed text-neutral-600 dark:text-neutral-400 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div className="flex items-center gap-2 text-black dark:text-white font-black shrink-0">
                    <Activity size={12} className="text-blue-600 dark:text-blue-500" />
                    <span>7D TOP PROTOCOLS:</span>
                  </div>
                  {PERFORMANCE_MATRIX.slice(0, 3).map((p, i) => (
                    <div key={p.protocolName} className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600 dark:text-blue-500 font-black tabular-nums">{p.usageCount.toLocaleString()}</span>
                        <span className="text-neutral-500 dark:text-neutral-600 lowercase variant-small-caps">txs on</span>
                        <span className="text-black dark:text-white font-black">{p.protocolName}</span>
                      </div>
                      {i < 2 && <span className="text-neutral-300 dark:text-neutral-800 font-normal select-none">|</span>}
                    </div>
                  ))}
                </div>
                {/* Decorative scanning line */}
                <motion.div 
                  className="absolute inset-y-0 w-24 bg-linear-to-r from-transparent via-blue-500/5 to-transparent pointer-events-none"
                  animate={{ left: ["-100%", "200%"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute top-0 right-0 w-16 h-full bg-linear-to-l from-black/[0.02] dark:from-white/[0.02] to-transparent pointer-events-none" />
              </div>
              <div className="flex items-center justify-between px-1">
                 <div className="flex items-center gap-2 text-[8px] text-neutral-500 dark:text-neutral-600 font-bold uppercase tracking-[0.2em]">
                    <ShieldCheck size={10} className="text-blue-600 dark:text-blue-500" />
                    Decoding Validated by RPC
                 </div>
                 <span className="text-[8px] text-neutral-400 dark:text-neutral-700 italic">Source: Miniblocks.io</span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Panel title="Current Progress">
           <div className="space-y-8">
              <div className="flex gap-6">
                 <div className="text-8xl font-black text-black/5 dark:text-white/5 tracking-tighter leading-none italic font-serif">
                    S1
                 </div>
                 <div className="flex flex-col justify-center">
                    <h3 className="text-xl font-bold uppercase tracking-tighter text-black dark:text-white">Season 1: Alpha</h3>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-500 uppercase tracking-widest mt-1 font-bold">Ends: June 23</p>
                 </div>
              </div>
              
              <div className="p-6 border border-black/5 dark:border-white/5 bg-white/40 dark:bg-black/40 backdrop-blur-sm">
                 <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed uppercase tracking-widest text-[9px] font-bold">
                    Analysis of the MegaETH ecosystem using real-time data ingestion. 
                    Search a wallet to begin decoding.
                 </p>
              </div>
           </div>
        </Panel>
      </div>
    </div>
  );
}
