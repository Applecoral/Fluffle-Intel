import { useState, useMemo, ChangeEvent, useEffect, MouseEvent } from "react";
import { LEADERBOARD_DATA } from "../lib/data";
import { Panel, BunnyLogo } from "./ui/Tactical";
import { Search, ExternalLink, Loader2, Copy, Check } from "lucide-react";
import { fetchWalletPoints, PointsData } from "../services/megaethService";
import { motion, AnimatePresence } from "motion/react";

interface LeaderboardPageProps {
  onSelectWallet: (address: string, rank: number) => void;
}

export function LeaderboardPage({ onSelectWallet }: LeaderboardPageProps) {
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [livePoints, setLivePoints] = useState<Record<string, PointsData>>({});
  const [isLoadingPoints, setIsLoadingPoints] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // The pre-loaded data is the single source of truth for the ranking
  const mergedData = useMemo(() => {
    return [...LEADERBOARD_DATA].sort((a, b) => a.rank - b.rank);
  }, []);

  const filteredData = useMemo(() => {
    return mergedData.filter(entry => 
      entry.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.topProtocol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [mergedData, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Fetch live points for the current page
  useEffect(() => {
    const fetchPagePoints = async () => {
      setIsLoadingPoints(true);
      const promises = currentData.map(entry => fetchWalletPoints(entry.address));
      const results = await Promise.all(promises);
      
      const pointsMap: Record<string, PointsData> = {};
      results.forEach((data, index) => {
        pointsMap[currentData[index].address] = data;
      });
      
      setLivePoints(prev => ({ ...prev, ...pointsMap }));
      setIsLoadingPoints(false);
    };

    if (currentData.length > 0) {
      fetchPagePoints();
    }
  }, [currentData]);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (count: number) => {
    setItemsPerPage(count);
    setCurrentPage(1);
  };

  const copyToClipboard = (address: string, e: MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-black/10 dark:border-white/10 pb-8 gap-6 relative overflow-hidden transition-colors">
        <BunnyLogo className="absolute -right-2 top-0 opacity-5 dark:opacity-10 scale-50" />
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-black dark:text-white uppercase flex items-baseline gap-4">
            Leaderboard
            {isLoadingPoints && <Loader2 size={16} className="animate-spin text-blue-600 dark:text-blue-500 inline" />}
          </h1>
          <p className="text-neutral-700 dark:text-neutral-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2 transition-colors">
            Global performance rankings // {LEADERBOARD_DATA.length.toLocaleString()} wallets
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
           <div className="flex items-center gap-2 bg-white dark:bg-black border border-black/10 dark:border-white/10 p-1 shadow-sm dark:shadow-none">
              <span className="px-2 text-[8px] text-neutral-600 dark:text-neutral-600 uppercase font-bold">Show:</span>
              {[50, 100].map((size) => (
                <button
                  key={size}
                  onClick={() => handleItemsPerPageChange(size)}
                  className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest transition-all ${itemsPerPage === size ? "bg-black text-white dark:bg-blue-500 dark:text-white" : "text-neutral-500 dark:text-neutral-500 hover:text-black dark:hover:text-white"}`}
                >
                  {size}
                </button>
              ))}
           </div>

           <div className="relative group w-full md:w-80">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-500 transition-colors" />
              <input 
                 type="text" 
                 placeholder="SEARCH ADDRESS..."
                 value={searchQuery}
                 onChange={handleSearch}
                 className="bg-white dark:bg-black border border-black/10 dark:border-white/10 pl-11 pr-6 py-3 text-[10px] uppercase font-bold tracking-widest text-black dark:text-white focus:outline-none focus:border-blue-500 transition-all w-full placeholder:text-neutral-400 dark:placeholder:text-neutral-700 shadow-sm dark:shadow-none"
              />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-12">
          <Panel title="Wallet Rankings">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-black/5 dark:border-white/5 text-neutral-600 dark:text-neutral-500 text-[9px] font-bold uppercase tracking-[0.2em]">
                    <th className="px-6 py-4 text-left w-16 md:w-24">Rank</th>
                    <th className="px-6 py-4 text-left">Wallet Address</th>
                    <th className="px-6 py-4 text-left">Total Points</th>
                    <th className="px-6 py-4 text-left hidden md:table-cell">Weekly</th>
                    <th className="px-6 py-4 text-left hidden lg:table-cell">Top Protocol</th>
                    <th className="px-6 py-4 text-right w-16">View</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {currentData.map((entry) => (
                    <tr 
                      key={entry.address} 
                      className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                      onClick={() => onSelectWallet(entry.address, entry.rank)}
                    >
                      <td className="px-6 py-5 text-neutral-600 dark:text-neutral-500 font-sans font-black">
                        {entry.rank.toString().padStart(2, '0')}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="text-black dark:text-white font-bold group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors tracking-tight text-xs uppercase">
                            <span className="md:hidden">{entry.address.slice(0, 6)}...{entry.address.slice(-4)}</span>
                            <span className="hidden md:inline lg:hidden">{entry.address.slice(0, 12)}...{entry.address.slice(-4)}</span>
                            <span className="hidden lg:inline">{entry.address}</span>
                          </div>
                          <button 
                            onClick={(e) => copyToClipboard(entry.address, e)}
                            className="p-1.5 border border-black/5 dark:border-white/5 bg-black/2 dark:bg-white/2 hover:bg-blue-500/10 hover:border-blue-500/30 text-neutral-500 dark:text-neutral-600 hover:text-blue-600 dark:hover:text-blue-500 transition-all rounded"
                            title="Copy Address"
                          >
                            {copiedAddress === entry.address ? <Check size={10} /> : <Copy size={10} />}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-neutral-700 dark:text-neutral-300 font-mono text-xs">
                        {livePoints[entry.address]?.allTimePoints != null 
                          ? livePoints[entry.address].allTimePoints.toLocaleString() 
                          : entry.allTimePoints > 0 ? entry.allTimePoints.toLocaleString() : "---"}
                      </td>
                      <td className="px-6 py-5 hidden md:table-cell">
                        {(livePoints[entry.address]?.weeklyPoints ?? entry.weeklyPoints) > 0 ? (
                            <span className="text-blue-600 dark:text-blue-500 font-bold">+{(livePoints[entry.address]?.weeklyPoints ?? entry.weeklyPoints).toLocaleString()}</span>
                        ) : (
                            <span className="text-neutral-300 dark:text-neutral-700">---</span>
                        )}
                      </td>
                      <td className="px-6 py-5 hidden lg:table-cell">
                         <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                           {livePoints[entry.address]?.topProtocol || entry.topProtocol}
                         </span>
                      </td>
                      <td className="px-6 py-5 text-right text-neutral-400 dark:text-neutral-500">
                        <ExternalLink size={12} className="ml-auto group-hover:text-blue-600 dark:group-hover:text-blue-500" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-6">
         <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-600 dark:text-neutral-500">
            Page {currentPage.toString().padStart(2, '0')} // {totalPages.toString().padStart(2, '0')}
         </div>
         <div className="flex flex-wrap justify-center gap-2">
             <button 
                 onClick={() => setCurrentPage(1)}
                 disabled={currentPage === 1}
                 className="px-3 md:px-4 py-2 border border-black/10 dark:border-white/10 text-[10px] font-bold uppercase tracking-widest text-neutral-600 hover:text-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
             >
                 First
             </button>
             <button 
                 onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                 disabled={currentPage === 1}
                 className="px-3 md:px-4 py-2 border border-black/10 dark:border-white/10 text-[10px] font-bold uppercase tracking-widest text-neutral-600 hover:text-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
             >
                 Prev
             </button>
             
             <div className="hidden sm:flex gap-1">
                {getPageNumbers().map((pageNum) => (
                   <button 
                     key={pageNum}
                     onClick={() => setCurrentPage(pageNum)}
                     className={`min-w-[32px] md:min-w-[40px] h-8 md:h-10 border font-bold text-[10px] uppercase tracking-widest transition-all ${currentPage === pageNum ? "border-blue-600 text-blue-600 bg-blue-500/5 dark:border-blue-500 dark:text-blue-500 dark:bg-blue-500/5" : "border-black/10 dark:border-white/10 text-neutral-600 hover:text-black dark:hover:text-white"}`}
                   >
                     {pageNum}
                   </button>
                ))}
             </div>

             <button 
                 onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                 disabled={currentPage === totalPages}
                 className="px-3 md:px-4 py-2 border border-black/10 dark:border-white/10 text-[10px] font-bold uppercase tracking-widest text-neutral-600 hover:text-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
             >
                 Next
             </button>
             <button 
                 onClick={() => setCurrentPage(totalPages)}
                 disabled={currentPage === totalPages}
                 className="px-3 md:px-4 py-2 border border-black/10 dark:border-white/10 text-[10px] font-bold uppercase tracking-widest text-neutral-600 hover:text-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
             >
                 Last
             </button>
         </div>
      </div>
    </div>
  );
}
