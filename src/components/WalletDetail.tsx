import { useState, useEffect } from "react";
import { fetchWalletTransactions, fetchWalletPoints } from "../services/megaethService";
import { interpretTransaction, summarizeWallet } from "../lib/interpreter";
import { WalletProfile, InterpretedTransaction } from "../types";
import { Panel, Badge, TacticalButton } from "./ui/Tactical";
import { ArrowLeft, Clock, Link as LinkIcon, AlertCircle, Loader2, CheckCircle2, XCircle, Copy, Check, Activity, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LEADERBOARD_DATA } from "../lib/data";

interface WalletDetailProps {
  address: string;
  onBack: () => void;
  rank?: number;
}

export function WalletDetail({ address, onBack, rank = 0 }: WalletDetailProps) {
  const [profile, setProfile] = useState<WalletProfile | null>(null);
  const [interpretedTxs, setInterpretedTxs] = useState<InterpretedTransaction[]>([]);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  useEffect(() => {
    async function loadWalletData() {
      setIsLoading(true);
      try {
        // Find static data as a base
        const staticEntry = LEADERBOARD_DATA.find(e => e.address.toLowerCase() === address.toLowerCase());
        
        const [transactions, pointsData] = await Promise.all([
          fetchWalletTransactions(address),
          fetchWalletPoints(address)
        ]);
        
        const interpreted = transactions.map(interpretTransaction);
        setInterpretedTxs(interpreted);

        const finalRank = rank || pointsData.rank || staticEntry?.rank || 0;
        const finalPoints = pointsData.allTimePoints || staticEntry?.allTimePoints || 0;
        const finalWeekly = pointsData.weeklyPoints || staticEntry?.weeklyPoints || 0;

        const summaryProfile = summarizeWallet(
          address, 
          transactions, 
          finalRank, 
          finalPoints, 
          finalWeekly
        );
        
        setProfile({
          ...summaryProfile,
          topProtocol: pointsData.topProtocol !== "Unknown" ? pointsData.topProtocol : (summaryProfile.topProtocol || staticEntry?.topProtocol || "Unknown")
        });
      } catch (error) {
        console.error("Error loading wallet details:", error);
        // Fallback to static data only if fetch fails
        const staticEntry = LEADERBOARD_DATA.find(e => e.address.toLowerCase() === address.toLowerCase());
        if (staticEntry) {
           setProfile({
              address,
              rank: staticEntry.rank,
              allTimePoints: staticEntry.allTimePoints,
              weeklyPoints: staticEntry.weeklyPoints,
              topProtocol: staticEntry.topProtocol,
              transactions: [],
              interpretedTransactions: [],
              dominantCategory: "unknown",
              summary: "Could not fetch real-time transaction data. Displaying historical stats.",
              lastUpdated: new Date().toISOString()
           });
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadWalletData();
  }, [address, rank]);

  const handleBack = () => {
    onBack();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 size={40} className="text-blue-500 animate-spin" />
      <span className="text-neutral-500 font-sans font-bold uppercase tracking-[0.3em] animate-pulse">Analyzing Chain Activity...</span>
    </div>
  );

  if (!profile) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <AlertCircle size={40} className="text-white/10 mb-4" />
      <span className="text-neutral-500 font-sans font-bold uppercase tracking-[0.3em]">Node link lost</span>
    </div>
  );

  const filteredTransactions = interpretedTxs.filter(tx => {
    if (activeFilter === "all") return true;
    if (activeFilter === "failed") return tx.failed;
    return tx.category === activeFilter;
  });

  const groupedByProtocol = filteredTransactions.reduce((acc, tx) => {
    const key = tx.protocol;
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {} as Record<string, InterpretedTransaction[]>);

  const protocols = Object.keys(groupedByProtocol).sort((a, b) => 
    groupedByProtocol[b].length - groupedByProtocol[a].length
  );

  return (
    <div className="flex flex-col gap-12 pb-20">
      <div className="flex items-center gap-8 border-b border-white/5 pb-8 relative">
        <button onClick={onBack} className="p-4 border border-white/5 bg-white/5 hover:bg-white hover:text-black transition-all">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-4">
                <h1 className="text-4xl font-black tracking-tighter text-white uppercase flex items-center gap-4">
                  {profile.address.slice(0, 16)}...{profile.address.slice(-4)}
                </h1>
                <button 
                  onClick={copyToClipboard}
                  className="p-2 border border-white/5 bg-white/5 hover:bg-blue-500/10 hover:border-blue-500/30 text-neutral-500 hover:text-blue-500 transition-all rounded"
                  title="Copy Full Address"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <div className="flex gap-4 mt-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500">Active</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600">•</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Rank #{profile.rank}</span>
              </div>
            </div>
            <TacticalButton 
                onClick={() => alert(`Following wallet: ${profile.address}`)}
                className="!py-3 !px-8"
            >
                Follow Wallet
            </TacticalButton>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Panel title="Overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
             <div className="space-y-1">
               <span className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-bold">Total Points</span>
               <div className="text-4xl font-black text-white tracking-tighter">{profile.allTimePoints.toLocaleString()}</div>
             </div>
             <div className="space-y-1 border-l border-white/5 pl-12">
               <span className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-bold">Weekly Performance</span>
               <div className="text-4xl font-black text-blue-400 tracking-tighter">+{profile.weeklyPoints.toLocaleString()}</div>
             </div>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-4 space-y-12">
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-blue-500 block">System Interpretation</span>
            <p className="text-sm text-neutral-400 font-medium leading-relaxed border-l-2 border-blue-500/30 pl-6 py-2">
              All transactions decoded via local registry lookup. Verification complete.
            </p>
          </div>
          
          <Panel title="Protocol Usage">
             <div className="space-y-6">
                {Object.entries(
                   profile.interpretedTransactions.reduce((acc, tx) => {
                     acc[tx.protocol] = (acc[tx.protocol] || 0) + 1;
                     return acc;
                   }, {} as Record<string, number>)
                ).map(([p, count]) => (
                  <div key={p} className="space-y-2">
                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest">
                      <span className="text-neutral-400 truncate max-w-[180px]">{p}</span>
                      <span className="text-neutral-600">{count} Events</span>
                    </div>
                    <div className="w-full h-[1px] bg-white/5">
                      <div className="h-full bg-blue-500" style={{ width: `${(Number(count) / profile.transactions.length) * 100}%` }} />
                    </div>
                  </div>
                ))}
             </div>
          </Panel>
        </div>

        <div className="md:col-span-8 flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
             <div className="flex gap-8">
                {["all", "lend", "swap", "bridge", "failed"].map((f) => (
                  <button 
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative ${activeFilter === f ? "text-blue-500" : "text-neutral-500 hover:text-white"}`}
                  >
                    {f}
                    {activeFilter === f && <motion.div layoutId="filter-underline" className="absolute -bottom-[17px] left-0 right-0 h-[1px] bg-blue-500" />}
                  </button>
                ))}
             </div>
             <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-600 italic">Total: {filteredTransactions.length}</span>
          </div>

          <div className="space-y-12 overflow-y-auto max-h-[800px] pr-4 custom-scrollbar">
             {protocols.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 border border-white/5 bg-black/20 gap-4">
                 <Activity size={32} className="text-white/5" />
                 <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600">No transactions detected on-chain</span>
               </div>
             ) : (
               <AnimatePresence mode="popLayout">
                 {protocols.map((protocol) => (
                   <div key={protocol} className="space-y-4">
                     <div className="flex items-center gap-4">
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 bg-white/5 py-1 px-3 border border-white/5">{protocol}</span>
                       <div className="h-[1px] flex-1 bg-white/5" />
                       <span className="text-[9px] font-bold text-neutral-500">{groupedByProtocol[protocol].length} Actions</span>
                     </div>
                     
                     <div className="space-y-3">
                       {groupedByProtocol[protocol].map((tx, i) => (
                         <motion.div
                            key={tx.hash}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className={`p-5 border border-white/5 bg-[#0a0a0a] hover:bg-white/5 transition-all flex justify-between items-center group ${tx.failed ? "border-red-900/20" : ""}`}
                         >
                            <div className="flex items-center gap-6">
                               <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${tx.failed ? "border-red-500/20 text-red-500 bg-red-500/5" : "border-white/5 text-neutral-600 group-hover:text-blue-500 bg-white/2"}`}>
                                  {tx.failed ? <XCircle size={12} /> : <CheckCircle2 size={12} />}
                               </div>
                               <div>
                                  <div className="text-sm font-bold text-white tracking-tight leading-none group-hover:text-blue-500 transition-colors uppercase flex items-center gap-3">
                                     {tx.sentence}
                                     {tx.failed && <span className="text-[8px] bg-red-500/10 text-red-500 px-2 py-0.5 border border-red-500/10 tracking-widest">ERROR</span>}
                                  </div>
                                  <div className="flex items-center gap-4 mt-2">
                                     <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-neutral-600 group-hover:text-blue-400 transition-colors">{tx.category}</span>
                                     <span className="w-1 h-1 bg-white/10 rounded-full" />
                                     <span className="text-[9px] text-neutral-500 uppercase flex items-center gap-2">
                                        <Activity size={10} /> {tx.time}
                                     </span>
                                  </div>
                               </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                               <span className="text-[9px] font-mono text-neutral-700 uppercase group-hover:text-neutral-500 transition-colors">{tx.hash.slice(0, 8)}</span>
                               <a href={`https://miniblocks.io/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-neutral-500 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all">
                                  <ArrowRight size={10} />
                               </a>
                            </div>
                         </motion.div>
                       ))}
                     </div>
                  </div>
                 ))}
               </AnimatePresence>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
