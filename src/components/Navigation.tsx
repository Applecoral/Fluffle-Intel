import { Rocket, Wallet, Trophy, Sword, HelpCircle } from "lucide-react";
import { TacticalButton } from "./ui/Tactical";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: "booster", label: "Booster", icon: <Rocket size={16} /> },
    { id: "leaderboard", label: "Ranking", icon: <Wallet size={16} /> },
    { id: "strategies", label: "Tactics", icon: <Sword size={16} /> },
    { id: "guide", label: "Intelligence", icon: <HelpCircle size={16} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[#080808] border-t border-white/10 flex items-center justify-between px-12 z-50">
      <div className="flex gap-4 h-full py-4">
        {tabs.map((tab) => (
          <TacticalButton
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
            icon={tab.icon}
            className="px-10"
          >
            {tab.label}
          </TacticalButton>
        ))}
      </div>
      
      <div className="flex flex-col items-end opacity-20 pointer-events-none">
         <span className="text-[10px] font-sans font-bold uppercase tracking-[0.4em]">Sub-sector 043</span>
         <span className="text-[8px] font-mono">X: 46.72 Y: 80.12</span>
      </div>
    </nav>
  );
}
