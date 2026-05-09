import { User } from "lucide-react";
import { motion } from "motion/react";

export function Header() {
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

      <div className="flex items-center gap-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600 animate-pulse">
           Live Terminal Feed
        </div>
      </div>
    </header>
  );
}
