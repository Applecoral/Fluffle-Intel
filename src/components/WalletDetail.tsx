import { useState, useEffect } from "react";
import { fetchWalletTransactions, fetchWalletPoints } from "../services/megaethService";
import { interpretTransaction, summarizeWallet } from "../lib/interpreter";
import { WalletProfile, InterpretedTransaction } from "../types";
import { Panel, Badge, TacticalButton } from "./ui/Tactical";
import { ArrowLeft, Clock, Link as LinkIcon, AlertCircle, Loader2, CheckCircle2, XCircle, Copy, Check, Activity, ArrowRight, ExternalLink, X } from "lucide-react";
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
  const [selectedTx, setSelectedTx] = useState<InterpretedTransaction | null>(null);

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
        setInterpretedTxs([]);
        
        setProfile({
          address,
          rank: staticEntry?.rank || 0,
          allTimePoints: staticEntry?.allTimePoints || 0,
          weeklyPoints: staticEntry?.weeklyPoints || 0,
          topProtocol: staticEntry?.topProtocol || "Unknown",
          transactions: [],
          interpretedTransactions: [],
          dominantCategory: "unknown",
          summary: "Real-time sync failed. Please check node connection or try again later.",
          lastUpdated: new Date().toISOString()
        });
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
      <span className="text-neutral-600 dark:text-neutral-500 font-sans font-bold uppercase tracking-[0.3em] animate-pulse">Analyzing Chain Activity...</span>
    </div>
  );

  if (!profile) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <AlertCircle size={40} className="text-black/10 dark:text-white/10 mb-4" />
      <span className="text-neutral-600 dark:text-neutral-500 font-sans font-bold uppercase tracking-[0.3em]">Node link lost</span>
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-8 border-b border-black/10 dark:border-white/5 pb-8 relative transition-colors">
        <button onClick={onBack} className="p-3 md:p-4 border border-black/10 dark:border-white/5 bg-white/40 dark:bg-white/5 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 w-full">
          <div className="flex flex-col xl:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-4">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-black dark:text-white uppercase flex items-center gap-4">
                  <span className="hidden sm:inline">{profile.address.slice(0, 16)}...{profile.address.slice(-4)}</span>
                  <span className="sm:hidden">{profile.address.slice(0, 10)}...{profile.address.slice(-4)}</span>
                </h1>
                <button 
                  onClick={copyToClipboard}
                  className="p-2 border border-black/10 dark:border-white/5 bg-white/20 dark:bg-white/5 hover:bg-blue-500/10 hover:border-blue-500/30 text-neutral-600 hover:text-blue-600 dark:hover:text-blue-500 transition-all rounded"
                  title="Copy Full Address"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <div className="flex gap-4 mt-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-500">Active</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300 dark:text-neutral-600">•</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-400">Rank #{profile.rank}</span>
              </div>
            </div>
            <TacticalButton 
                onClick={() => alert(`Following wallet: ${profile.address}`)}
                className="!py-3 !px-8 w-full sm:w-auto"
            >
                Follow Wallet
            </TacticalButton>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Panel title="Overview">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12">
             <div className="space-y-1">
                <span className="text-[10px] text-neutral-600 dark:text-neutral-500 uppercase tracking-[0.2em] font-bold">Total Points</span>
                <div className="text-3xl md:text-4xl font-black text-black dark:text-white tracking-tighter">{profile.allTimePoints.toLocaleString()}</div>
             </div>
             <div className="space-y-1 sm:border-l border-black/10 dark:border-white/5 sm:pl-12 transition-colors">
                <span className="text-[10px] text-neutral-600 dark:text-neutral-500 uppercase tracking-[0.2em] font-bold">Weekly Performance</span>
                <div className="text-3xl md:text-4xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">+{profile.weeklyPoints.toLocaleString()}</div>
             </div>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-4 space-y-12">
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-blue-600 dark:text-blue-500 block">System Interpretation</span>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed border-l-2 border-blue-500/30 pl-6 py-2">
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
                    <div className="flex justify-between text-[9px] uppercase font-bold tracking-widest">
                      <span className="text-neutral-700 dark:text-neutral-400 truncate max-w-[180px]">{p}</span>
                      <span className="text-neutral-500 dark:text-neutral-600">{count} Events</span>
                    </div>
                    <div className="w-full h-[1px] bg-black/5 dark:bg-white/5 transition-colors">
                      <div className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-500" style={{ width: `${(Number(count) / (profile.transactions.length || 1)) * 100}%` }} />
                    </div>
                  </div>
                ))}
             </div>
          </Panel>
        </div>

        <div className="md:col-span-8 flex flex-col gap-6 overflow-hidden">
          <div className="flex justify-between items-center border-b border-black/10 dark:border-white/5 pb-4 overflow-x-auto no-scrollbar transition-colors">
             <div className="flex gap-6 md:gap-8 min-w-max pr-4">
                {["all", "lend", "swap", "bridge", "failed"].map((f) => (
                  <button 
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all relative pb-2 ${activeFilter === f ? "text-blue-600 dark:text-blue-500" : "text-neutral-500 dark:text-neutral-500 hover:text-black dark:hover:text-white"}`}
                  >
                    {f}
                    {activeFilter === f && <motion.div layoutId="filter-underline" className="absolute bottom-0 left-0 right-0 h-[1px] bg-blue-600 dark:bg-blue-500" />}
                  </button>
                ))}
             </div>
             <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-600 italic whitespace-nowrap">Total: {filteredTransactions.length}</span>
          </div>

          <div className="space-y-12 overflow-y-auto max-h-[800px] pr-4 custom-scrollbar">
             {protocols.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 border border-black/5 dark:border-white/5 bg-black/5 dark:bg-black/20 gap-4 rounded-lg">
                 <Activity size={32} className="text-black/5 dark:text-white/5" />
                 <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-600">No transactions detected on-chain</span>
               </div>
             ) : (
               <AnimatePresence mode="popLayout">
                 {protocols.map((protocol) => (
                   <div key={protocol} className="space-y-4">
                     <div className="flex items-center gap-4">
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-600 bg-black/5 dark:bg-white/5 py-1 px-3 border border-black/5 dark:border-white/5">{protocol}</span>
                       <div className="h-[1px] flex-1 bg-black/5 dark:bg-white/5" />
                       <span className="text-[9px] font-bold text-neutral-500 dark:text-neutral-500">{groupedByProtocol[protocol].length} Actions</span>
                     </div>
                     
                     <div className="space-y-3">
                       {groupedByProtocol[protocol].map((tx, i) => (
                         <motion.div
                            key={tx.hash}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className={`p-5 border border-black/5 dark:border-white/5 bg-white/40 dark:bg-[#0a0a0a] hover:bg-black/5 dark:hover:bg-white/5 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center group cursor-pointer gap-4 shadow-sm dark:shadow-none ${tx.failed ? "border-red-600/20 dark:border-red-900/20" : ""}`}
                            onClick={() => setSelectedTx(tx)}
                         >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6 w-full min-w-0">
                               <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-colors ${tx.failed ? "border-red-500/20 text-red-600 dark:text-red-500 bg-red-500/5" : "border-black/5 dark:border-white/5 text-neutral-600 dark:text-neutral-600 group-hover:text-blue-600 dark:group-hover:text-blue-500 bg-black/2 dark:bg-white/2"}`}>
                                  {tx.failed ? <XCircle size={12} /> : <CheckCircle2 size={12} />}
                               </div>
                               <div className="flex-1 min-w-0">
                                  <div className="text-sm font-bold text-black dark:text-white tracking-tight leading-normal sm:leading-none group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors uppercase flex flex-wrap items-center gap-x-3 gap-y-1">
                                     <span className="truncate max-w-full block">{tx.sentence}</span>
                                     {tx.failed && <span className="text-[8px] bg-red-500/10 text-red-600 dark:text-red-500 px-2 py-0.5 border border-red-500/10 tracking-widest shrink-0">ERROR</span>}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                                     <span className="text-[9px] font-black uppercase tracking-[0.1em] text-neutral-600 dark:text-neutral-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">{tx.category}</span>
                                     <span className="hidden sm:block w-1 h-1 bg-black/10 dark:bg-white/10 rounded-full transition-colors" />
                                     <span className="text-[9px] text-neutral-600 dark:text-neutral-500 uppercase flex items-center gap-2 font-bold">
                                        <Activity size={10} /> {tx.time}
                                     </span>
                                  </div>
                               </div>
                            </div>
                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto gap-4 sm:gap-2">
                               <span className="text-[9px] font-mono text-neutral-500 dark:text-neutral-700 uppercase group-hover:text-neutral-700 dark:group-hover:text-neutral-500 transition-colors">{tx.hash.slice(0, 8)}</span>
                               <div className="w-7 h-7 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center text-neutral-500 dark:text-neutral-500 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white dark:hover:text-white hover:border-blue-600 dark:hover:border-blue-500 transition-all">
                                  <ExternalLink size={10} />
                               </div>
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

      <AnimatePresence>
        {selectedTx && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-colors"
            onClick={() => setSelectedTx(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-lg bg-[#fbfbfb] dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 p-8 space-y-8 relative shadow-2xl transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedTx(null)}
                className="absolute top-6 right-6 text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="space-y-2">
                <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${selectedTx.failed ? "text-red-600 dark:text-red-500" : "text-blue-600 dark:text-blue-500"}`}>
                   {selectedTx.failed ? "Transaction Failed" : "Transaction Verified"}
                </span>
                <h2 className="text-2xl font-black text-black dark:text-white uppercase tracking-tight leading-tight">
                  {selectedTx.sentence}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-8 border-y border-black/10 dark:border-white/5 py-8 transition-colors">
                <div className="space-y-1">
                  <span className="text-[9px] text-neutral-500 dark:text-neutral-600 uppercase font-black tracking-widest">Protocol</span>
                  <div className="text-sm font-bold text-black dark:text-white uppercase">{selectedTx.protocol}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-neutral-500 dark:text-neutral-600 uppercase font-black tracking-widest">Category</span>
                  <div className="text-sm font-bold text-black dark:text-white uppercase">{selectedTx.category}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-neutral-500 dark:text-neutral-600 uppercase font-black tracking-widest">Time</span>
                  <div className="text-sm font-bold text-black dark:text-white uppercase">{selectedTx.time}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-neutral-500 dark:text-neutral-600 uppercase font-black tracking-widest">Method</span>
                  <div className="text-sm font-bold text-black dark:text-white uppercase font-mono">{selectedTx.categoryLabel}</div>
                </div>
              </div>

              <div className="space-y-4">
                 <div className="space-y-1">
                    <span className="text-[9px] text-neutral-500 dark:text-neutral-600 uppercase font-black tracking-widest">Transaction Hash</span>
                    <div className="text-[10px] font-mono text-neutral-600 dark:text-neutral-400 break-all bg-black/5 dark:bg-white/2 p-3 border border-black/5 dark:border-white/5 transition-colors">
                       {selectedTx.hash}
                    </div>
                 </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a 
                   href={`https://miniblocks.io/tx/${selectedTx.hash}`} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex-1 flex items-center justify-center gap-3 bg-black text-white dark:bg-white dark:text-black font-black uppercase text-[10px] tracking-widest py-4 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-md dark:shadow-none"
                >
                   View on Miniblocks <ExternalLink size={14} />
                </a>
                <button 
                  onClick={() => setSelectedTx(null)}
                  className="flex-1 border border-black/10 dark:border-white/10 text-black dark:text-white font-black uppercase text-[10px] tracking-widest py-4 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
