import { Home, Wallet } from "lucide-react";
import { motion } from "motion/react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: "booster", label: "Home", icon: <Home size={18} /> },
    { id: "leaderboard", label: "Ranking", icon: <Wallet size={18} /> },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 h-14 sm:h-16 bg-white/80 dark:bg-black/80 backdrop-blur-md rounded-2xl border border-black/5 dark:border-white/5 flex items-center px-2 z-50 transition-all shadow-2xl dark:shadow-blue-500/5">
      <div className="flex gap-1 h-full py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative flex items-center justify-center gap-2 px-6 sm:px-10 h-full rounded-xl transition-all duration-300 font-sans text-[10px] font-bold uppercase tracking-[0.2em] outline-none focus-visible:ring-2 focus-visible:ring-blue-500
              ${activeTab === tab.id 
                ? "text-blue-700 dark:text-blue-400 bg-blue-500/10" 
                : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
              }
            `}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            <span className={`${activeTab === tab.id ? "opacity-100" : "opacity-60"}`}>
              {tab.icon}
            </span>
            <span className="hidden sm:inline">{tab.label}</span>
            
            {activeTab === tab.id && (
              <motion.div 
                layoutId="active-tab"
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"
              />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
