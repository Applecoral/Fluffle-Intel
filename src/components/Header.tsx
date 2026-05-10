import { User } from "lucide-react";
import { motion } from "motion/react";

interface HeaderProps {
  connectedAddress: string | null;
  onConnect: () => void;
  onViewProfile?: () => void;
}

export function Header({ connectedAddress, onConnect, onViewProfile }: HeaderProps) {
  return (
    <header className="h-20 bg-black border-b border-white/5 flex items-center justify-between px-12 z-50 sticky top-0 backdrop-blur-md bg-opacity-80">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        </div>
        <div className="h-4 w-[1px] bg-white/10" />
        <motion.div 
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="text-sm font-black uppercase tracking-[0.6em] text-white"
        >
          Fluffle Intel
        </motion.div>
      </div>

      <div className="flex items-center gap-8">
        <div className="hidden md:block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600 animate-pulse">
           Live Terminal Feed
        </div>
        
        {connectedAddress ? (
          <button 
            onClick={onViewProfile}
            className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full hover:bg-blue-500/20 transition-all cursor-pointer"
          >
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">
              {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
            </span>
          </button>
        ) : (
          <button 
            onClick={onConnect}
            className="flex items-center gap-3 bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 px-6 py-2 rounded-full transition-all group"
          >
            <User size={12} className="text-neutral-500 group-hover:text-blue-500 transition-colors" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 group-hover:text-white transition-colors">Connect Wallet</span>
          </button>
        )}
      </div>
    </header>
  );
}
