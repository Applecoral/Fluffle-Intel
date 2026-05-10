import { useState } from "react";
import { Header } from "./components/Header";
import { Navigation } from "./components/Navigation";
import { Dashboard } from "./components/Dashboard";
import { LeaderboardPage } from "./components/LeaderboardPage";
import { WalletDetail } from "./components/WalletDetail";
import { StrategiesPage } from "./components/StrategiesPage";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [activeTab, setActiveTab] = useState("booster");
  const [selectedWallet, setSelectedWallet] = useState<{address: string, rank: number} | null>(null);

  const renderContent = () => {
    // If a wallet is selected, show its detail view
    if (selectedWallet) {
      return (
        <motion.div
           key="wallet-detail"
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -20 }}
        >
          <WalletDetail 
            address={selectedWallet.address} 
            rank={selectedWallet.rank}
            onBack={() => setSelectedWallet(null)} 
          />
        </motion.div>
      );
    }

    switch (activeTab) {
      case "booster":
      case "rank":
        return (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Dashboard onSelectWallet={(address, rank) => setSelectedWallet({ address, rank })} />
          </motion.div>
        );
      case "leaderboard":
        return (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LeaderboardPage 
              onSelectWallet={(address, rank) => setSelectedWallet({ address, rank })} 
            />
          </motion.div>
        );
      case "strategies":
        return (
          <motion.div
            key="strategies"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StrategiesPage />
          </motion.div>
        );
      case "guide":
        return (
           <motion.div 
              key="guide"
              className="flex flex-col items-center justify-center min-h-[400px] text-zinc-500 font-mono text-xs uppercase"
           >
              Targeting protocol documentation... [PENDING]
           </motion.div>
        )
      default:
        return <Dashboard />;
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedWallet(null);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans selection:bg-blue-500 selection:text-white">
      {/* Editorial Background Effect */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
         <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(to_bottom,rgba(59,130,246,0.05)_0%,transparent_100%)]" />
         <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_top,rgba(59,130,246,0.05)_0%,transparent_100%)]" />
         
         {/* Subtle Vertical Lines */}
         <div className="absolute inset-0 flex justify-between px-12 opacity-5">
            <div className="w-[1px] h-full bg-white" />
            <div className="w-[1px] h-full bg-white hidden md:block" />
            <div className="w-[1px] h-full bg-white hidden md:block" />
            <div className="w-[1px] h-full bg-white" />
         </div>
      </div>

      <Header />
      
      <main className="container mx-auto px-12 py-16 relative z-10 pb-40">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </main>

      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
      
      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] contrast-150 brightness-150" />
    </div>
  );
}
