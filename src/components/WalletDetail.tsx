import { useState, useEffect } from "react";
import { useWalletData, Transaction } from "../hooks/useWalletData";
import { Panel, Badge, TacticalButton } from "./ui/Tactical";
import { ArrowLeft, Clock, Link as LinkIcon, AlertCircle, Loader2, CheckCircle2, XCircle, Copy, Check, Activity, ArrowRight, ExternalLink, X, TrendingUp, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LEADERBOARD_DATA } from "../lib/data";

interface WalletDetailProps {
  address: string;
  onBack: () => void;
  rank?: number;
}

export function WalletDetail({ address, onBack, rank = 0 }: WalletDetailProps) {
  const { data: walletData, isLoading, error } = useWalletData(address);
  const [copied, setCopied] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Find static rank data if it exists
  const staticEntry = LEADERBOARD_DATA.find(e => e.address.toLowerCase() === address.toLowerCase());
  const displayRank = rank || staticEntry?.rank || "00";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
      <div className="relative">
        <Loader2 size={48} className="text-blue-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
           <span className="text-xl">🐰</span>
        </div>
      </div>
      <span className="text-neutral-600 dark:text-neutral-500 font-sans font-bold uppercase tracking-[0.3em] animate-pulse">Scanning chain...</span>
    </div>
  );

  if (error || !walletData) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 p-12 border border-red-500/10 bg-red-500/5 transition-colors">
      <AlertCircle size={40} className="text-red-500/50" />
      <div className="text-center space-y-2">
        <span className="text-red-600 dark:text-red-500 font-sans font-black uppercase tracking-[0.2em] block">[ERROR] Internal Node Link Error</span>
        <p className="text-neutral-600 dark:text-neutral-400 text-xs font-medium max-w-md mx-auto">{error || "Failed to establish secure connection to MegaETH RPC."}</p>
      </div>
      <TacticalButton onClick={onBack} className="!py-2 !px-6 border-red-500/20 text-red-600 dark:text-red-500 hover:bg-red-500/10">
        Return to Safety
      </TacticalButton>
    </div>
  );

  const filteredTransactions = walletData.recentActivity.filter(tx => {
    if (activeFilter === "all") return true;
    if (activeFilter === "failed") return tx.failed;
    return tx.category === activeFilter;
  });

  const groupedByProtocol = filteredTransactions.reduce((acc, tx) => {
    const key = tx.protocol;
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {} as Record<string, Transaction[]>);

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
                  <span className="hidden sm:inline">{walletData.address.slice(0, 16)}...{walletData.address.slice(-4)}</span>
                  <span className="sm:hidden">{walletData.address.slice(0, 10)}...{walletData.address.slice(-4)}</span>
                </h1>
                <button 
                  onClick={copyToClipboard}
                  className="p-2 border border-black/10 dark:border-white/5 bg-white/20 dark:bg-white/5 hover:bg-blue-500/10 hover:border-blue-500/30 text-neutral-600 hover:text-blue-600 dark:hover:text-blue-500 transition-all rounded"
                  title="Copy Full Address"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <div className="bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded">
                   <span className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest leading-none">Recent TXs: {walletData.totalTx}</span>
                </div>
              </div>
              <div className="flex gap-4 mt-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-500">Active Scan</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300 dark:text-neutral-600">•</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-400">Gbl Rank #{displayRank}</span>
                {walletData.cached && (
                  <>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300 dark:text-neutral-600">•</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 dark:text-orange-500">Cached result</span>
                  </>
                )}
              </div>
            </div>
            <TacticalButton 
                onClick={() => alert(`Following wallet: ${walletData.address}`)}
                className="!py-3 !px-8 w-full sm:w-auto"
            >
                Follow Wallet
            </TacticalButton>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-4 space-y-12">
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-blue-600 dark:text-blue-500 block">System Interpretation</span>
            <div className="text-sm text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed border-l-2 border-blue-500/30 pl-6 py-2 transition-colors">
              {walletData.summary}
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
               <Badge type="default">{walletData.topProtocol}</Badge>
               <Badge type="default">{walletData.dominantCategory}</Badge>
               {walletData.failedTx > 0 && <Badge type="error">{walletData.failedTx} Failed</Badge>}
            </div>
          </div>
          
          <Panel title="Protocol Usage">
             <div className="space-y-6">
                {Object.entries(
                   walletData.recentActivity.reduce((acc, tx) => {
                     acc[tx.protocol] = (acc[tx.protocol] || 0) + 1;
                     return acc;
                   }, {} as Record<string, number>)
                ).sort((a, b) => (b[1] as number) - (a[1] as number)).map(([p, count]) => (
                  <div key={p} className="space-y-2">
                    <div className="flex justify-between text-[9px] uppercase font-bold tracking-widest">
                      <span className="text-neutral-700 dark:text-neutral-400 truncate max-w-[180px]">{p}</span>
                      <span className="text-neutral-500 dark:text-neutral-600">{count} Events</span>
                    </div>
                    <div className="w-full h-[1px] bg-black/5 dark:bg-white/5 transition-colors">
                      <div className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-500" style={{ width: `${(Number(count) / (walletData.totalTx || 1)) * 100}%` }} />
                    </div>
                  </div>
                ))}
             </div>
          </Panel>

          <div className="p-6 border border-black/10 dark:border-white/5 bg-white/40 dark:bg-black/40 space-y-4 transition-colors">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 dark:text-neutral-400">
                <ShieldCheck size={14} className="text-blue-600 dark:text-blue-500" />
                Security Report
             </div>
             <p className="text-[10px] font-medium text-neutral-500 dark:text-neutral-500 leading-relaxed uppercase tracking-tighter">
                Manual decoding active. All interactions verified against global protocol registry. Block range: last 50 blocks.
             </p>
          </div>
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
                                         <Clock size={10} /> {tx.time}
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
                   <span className="text-[9px] text-neutral-500 dark:text-neutral-600 uppercase font-black tracking-widest">Network</span>
                   <div className="text-sm font-bold text-black dark:text-white uppercase">MegaETH Mainnet</div>
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
                   href={`https://megaeth.blockscout.com/tx/${selectedTx.hash}`} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex-1 flex items-center justify-center gap-3 bg-black text-white dark:bg-white dark:text-black font-black uppercase text-[10px] tracking-widest py-4 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-md dark:shadow-none"
                >
                   View on Blockscout <ExternalLink size={14} />
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
