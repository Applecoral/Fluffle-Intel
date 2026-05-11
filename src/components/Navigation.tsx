import { Home, Wallet, Trophy, Sword, HelpCircle } from "lucide-react";
import { TacticalButton } from "./ui/Tactical";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: "booster", label: "Home", icon: <Home size={16} /> },
    { id: "leaderboard", label: "Ranking", icon: <Wallet size={16} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[#080808] border-t border-white/10 flex items-center justify-center md:justify-between px-6 md:px-12 z-50">
      <div className="flex gap-2 md:gap-4 h-full py-4 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <TacticalButton
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
            icon={tab.icon}
            className="px-6 md:px-10 whitespace-nowrap"
          >
            <span className="hidden sm:inline">{tab.label}</span>
          </TacticalButton>
        ))}
      </div>
    </nav>
  );
}
