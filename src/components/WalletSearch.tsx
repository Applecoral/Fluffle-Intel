import React, { useState } from "react";
import { Search, Loader2 } from "lucide-react";

interface WalletSearchProps {
  onSearch: (address: string) => void;
}

export function WalletSearch({ onSearch }: WalletSearchProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const address = input.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setError("Please enter a valid 0x wallet address");
      return;
    }

    onSearch(address);
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-blue-600 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="0x... wallet address"
            className="w-full bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-none py-4 pl-12 pr-4 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all placeholder:text-neutral-300 dark:placeholder:text-neutral-700"
          />
          {error && (
            <div className="absolute top-full left-0 mt-2 text-[10px] font-black uppercase text-red-600 tracking-widest">
              [ERROR] {error}
            </div>
          )}
        </div>
        <button
          type="submit"
          className="bg-black text-white dark:bg-white dark:text-black font-black uppercase text-xs tracking-[0.3em] px-8 py-4 sm:py-0 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-lg dark:shadow-none"
        >
          Decode
        </button>
      </form>
      <div className="flex justify-center gap-6">
         <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">MegaETH Mainnet</span>
         <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">•</span>
         <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Decoded Feed</span>
      </div>
    </div>
  );
}
