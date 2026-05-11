import { Sun, Moon } from "lucide-react";
import { motion } from "motion/react";
import { BunnyLogo } from "./ui/Tactical";
import { useTheme } from "../context/ThemeContext";

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-20 bg-[#f7f7f7]/80 dark:bg-black/80 border-b border-black/5 dark:border-white/5 flex items-center justify-between px-6 md:px-12 z-50 sticky top-0 backdrop-blur-md transition-colors duration-300">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center p-2 bg-blue-500/10 border border-blue-500/20">
          <BunnyLogo className="scale-75" />
        </div>
        <div className="h-4 w-[1px] bg-black/10 dark:bg-white/10" />
        <motion.div 
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="text-sm font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-black dark:text-white"
        >
          Fluffle Intel
        </motion.div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-black dark:text-white"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
