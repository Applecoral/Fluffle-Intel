import { useState, useMemo, ChangeEvent, useEffect } from "react";
import { LEADERBOARD_DATA } from "../lib/data";
import { Panel } from "./ui/Tactical";
import { Search, ExternalLink, Loader2 } from "lucide-react";
import { fetchWalletPoints, PointsData, fetchLeaderboard } from "../services/megaethService";
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
  const [liveLeaderboard, setLiveLeaderboard] = useState<any[]>([]);

  // Fetch live leaderboard on mount
  useEffect(() => {
    const getLeaderboard = async () => {
      setIsLoadingPoints(true);
      const data = await fetchLeaderboard(500); // Fetch top 500 for better coverage
      if (data && data.length > 0) {
        setLiveLeaderboard(data);
      }
      setIsLoadingPoints(false);
    };
    getLeaderboard();
  }, []);

  const mergedData = useMemo(() => {
    // If we have live leaderboard, we can use it to augment or provide the primary list
    const liveMap = new Map((liveLeaderboard || []).map(u => [u.address.toLowerCase(), u]));
    
    // Create a Set of all addresses from both sources
    const allAddresses = new Set([
        ...LEADERBOARD_DATA.map(e => e.address.toLowerCase()),
        ...liveLeaderboard.map(e => e.address.toLowerCase())
    ]);

    const results = Array.from(allAddresses).map(addr => {
        const entry = LEADERBOARD_DATA.find(e => e.address.toLowerCase() === addr);
        const liveUser = liveMap.get(addr);
        
        return {
            address: addr,
            rank: liveUser?.rank || entry?.rank || 9999,
            allTimePoints: liveUser?.points || liveUser?.total_points || entry?.allTimePoints || 0,
            weeklyPoints: liveUser?.weekly_points || liveUser?.weekly_total_points || entry?.weeklyPoints || 0,
            topProtocol: liveUser?.top_protocol || entry?.topProtocol || "Active User"
        };
    });

    // Filter out zero-point users if they are not in our initial dataset (to keep quality high)
    return results
      .filter(r => r.allTimePoints > 0 || LEADERBOARD_DATA.some(e => e.address.toLowerCase() === r.address.toLowerCase()))
      .sort((a, b) => a.rank - b.rank || b.allTimePoints - a.allTimePoints);
  }, [liveLeaderboard]);

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-8 gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase flex items-baseline gap-4">
            Leaderboard
            {isLoadingPoints && <Loader2 size={16} className="animate-spin text-blue-500 inline" />}
          </h1>
          <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
            Global performance rankings // {LEADERBOARD_DATA.length.toLocaleString()} wallets
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
           <div className="flex items-center gap-2 bg-black border border-white/10 p-1">
              <span className="px-2 text-[8px] text-neutral-600 uppercase font-bold">Show:</span>
              {[50, 100].map((size) => (
                <button
                  key={size}
                  onClick={() => handleItemsPerPageChange(size)}
                  className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest transition-all ${itemsPerPage === size ? "bg-blue-500 text-white" : "text-neutral-500 hover:text-white"}`}
                >
                  {size}
                </button>
              ))}
           </div>

           <div className="relative group w-full md:w-80">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-blue-500 transition-colors" />
              <input 
                 type="text" 
                 placeholder="SEARCH ADDRESS..."
                 value={searchQuery}
                 onChange={handleSearch}
                 className="bg-black border border-white/10 pl-11 pr-6 py-3 text-[10px] uppercase font-bold tracking-widest text-white focus:outline-none focus:border-blue-500 transition-all w-full placeholder:text-neutral-700"
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
                  <tr className="border-b border-white/5 text-neutral-500 text-[9px] font-bold uppercase tracking-[0.2em]">
                    <th className="px-6 py-4 text-left w-24">Rank</th>
                    <th className="px-6 py-4 text-left">Wallet Address</th>
                    <th className="px-6 py-4 text-left">Total Points</th>
                    <th className="px-6 py-4 text-left">Weekly</th>
                    <th className="px-6 py-4 text-left">Top Protocol</th>
                    <th className="px-6 py-4 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {currentData.map((entry) => (
                    <tr 
                      key={entry.address} 
                      className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer"
                      onClick={() => onSelectWallet(entry.address, entry.rank)}
                    >
                      <td className="px-6 py-5 text-neutral-500 font-sans font-black">
                        {entry.rank.toString().padStart(2, '0')}
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-white font-bold group-hover:text-blue-500 transition-colors tracking-tight text-xs">
                          {entry.address}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-neutral-300 font-mono text-xs">
                        {livePoints[entry.address]?.allTimePoints != null 
                          ? livePoints[entry.address].allTimePoints.toLocaleString() 
                          : entry.allTimePoints > 0 ? entry.allTimePoints.toLocaleString() : "---"}
                      </td>
                      <td className="px-6 py-5">
                        {(livePoints[entry.address]?.weeklyPoints ?? entry.weeklyPoints) > 0 ? (
                            <span className="text-blue-500 font-bold">+{(livePoints[entry.address]?.weeklyPoints ?? entry.weeklyPoints).toLocaleString()}</span>
                        ) : (
                            <span className="text-neutral-700">---</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                         <span className="text-[10px] font-medium text-neutral-400 capitalize">
                           {livePoints[entry.address]?.topProtocol || entry.topProtocol}
                         </span>
                      </td>
                      <td className="px-6 py-5 text-right text-neutral-500">
                        <ExternalLink size={12} className="ml-auto group-hover:text-blue-500" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-4">
         <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500">
            Page {currentPage.toString().padStart(2, '0')} // {totalPages.toString().padStart(2, '0')}
         </div>
         <div className="flex gap-2">
            <button 
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
                First
            </button>
            <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
                Prev
            </button>
            
            <div className="flex gap-1">
               {getPageNumbers().map((pageNum) => (
                  <button 
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`min-w-[40px] h-10 border font-bold text-[10px] uppercase tracking-widest transition-all ${currentPage === pageNum ? "border-blue-500 text-blue-500 bg-blue-500/5" : "border-white/10 text-neutral-500 hover:text-white"}`}
                  >
                    {pageNum}
                  </button>
               ))}
            </div>

            <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
                Next
            </button>
            <button 
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
                Last
            </button>
         </div>
      </div>
    </div>
  );
}
