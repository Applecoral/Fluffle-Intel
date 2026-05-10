import { User } from "lucide-react";
import { motion } from "motion/react";
import { BunnyLogo } from "./ui/Tactical";

export function Header() {
  return (
    <header className="h-20 bg-black border-b border-white/5 flex items-center justify-between px-12 z-50 sticky top-0 backdrop-blur-md bg-opacity-80">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center p-2 bg-blue-500/10 border border-blue-500/20">
          <BunnyLogo className="scale-75" />
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
           Mainnet Live Feed
        </div>
        
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
          <div className="w-1.5 h-1.5 bg-[#00ff85] rounded-full animate-ping" />
          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Connected to Frontier</span>
        </div>
      </div>
    </header>
  );
}
