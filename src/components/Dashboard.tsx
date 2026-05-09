import { motion } from "motion/react";
import { Panel, Badge, BunnyLogo } from "./ui/Tactical";
import { PERFORMANCE_MATRIX } from "../lib/data";
import { TrendingUp, Users, Activity } from "lucide-react";

export function Dashboard() {
  return (
    <div className="flex flex-col gap-12">
      <div className="flex justify-between items-start border-b border-white/5 pb-12 relative">
        <div className="flex-1">
          <h1 className="text-8xl font-black tracking-tighter uppercase mb-2">
            Fluffle Intel
          </h1>
          <div className="flex gap-12 items-start mt-4">
            <p className="max-w-xl text-neutral-400 font-medium leading-relaxed">
              Real-time wallet monitoring and protocol performance analysis on the MegaETH network.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <Panel title="Market Overview" className="md:col-span-4 h-full">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-end">
                <div className="text-6xl font-bold tracking-tighter italic">84<span className="text-xl align-top ml-1">%</span></div>
                <div className="text-[10px] uppercase tracking-widest text-blue-500 font-bold pb-1">Network Activity</div>
            </div>
            
            <div className="w-full bg-white/5 h-1 relative">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: "84%" }}
                   className="absolute top-0 left-0 bottom-0 bg-blue-500"
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Vol (24h)</span>
                    <span className="text-2xl font-bold tracking-tighter text-white">4.2K ETH</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Users</span>
                    <span className="text-2xl font-bold tracking-tighter text-white">82.4K</span>
                </div>
            </div>
          </div>
        </Panel>

        <Panel title="Protocol Share" className="md:col-span-8">
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {PERFORMANCE_MATRIX.slice(0, 4).map((strat) => (
                <div key={strat.protocolName} className="flex flex-col gap-2">
                   <div className="flex justify-between items-center text-neutral-500">
                     <span className="text-[9px] font-bold uppercase tracking-[0.2em]">{strat.category}</span>
                     {strat.isTrending && <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />}
                   </div>
                   <div className="text-5xl font-bold tracking-tighter text-white">{strat.percentage}<span className="text-lg">%</span></div>
                   <div className="text-[10px] text-neutral-500 font-medium truncate uppercase tracking-tighter">{strat.protocolName}</div>
                </div>
              ))}
           </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Panel title="Recent Updates">
           <div className="flex flex-col gap-6">
              {[
                "Large volume spike detected on Teko pool 0x3e...f2",
                "Gutter migration to V3 successful. 80% liquidity moved.",
                "Bridge inflow increasing from Ethereum Mainnet.",
                "New 'The Fluffle' NFT collections minted by top 100 wallets."
              ].map((intel, i) => (
                <div key={i} className="flex gap-4 pb-4 border-b border-white/5 last:border-0 group">
                   <span className="text-[10px] font-bold text-blue-500/50">0{i+1}</span>
                   <span className="text-sm text-neutral-400 leading-relaxed group-hover:text-white transition-colors">{intel}</span>
                </div>
              ))}
           </div>
        </Panel>

        <Panel title="Current Progress" className="bg-white/5">
           <div className="space-y-8">
              <div className="flex gap-6">
                 <div className="text-8xl font-black text-white/5 tracking-tighter leading-none italic font-serif">
                    S1
                 </div>
                 <div className="flex flex-col justify-center">
                    <h3 className="text-xl font-bold uppercase tracking-tighter text-white">Season 1: Alpha</h3>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">Ends: June 23</p>
                 </div>
              </div>
              
              <div className="p-6 border border-white/5 bg-black/40">
                 <p className="text-sm text-neutral-400 leading-relaxed uppercase tracking-widest text-[9px]">
                    Analysis of the MegaETH frontier using real-time data ingestion.
                 </p>
              </div>

              <div className="space-y-2">
                 <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">Global Adoption</span>
                    <span className="text-2xl font-bold tracking-tighter text-white">42%</span>
                 </div>
                 <div className="w-full bg-white/5 h-[1px]">
                    <div className="w-[42%] h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
                 </div>
              </div>
           </div>
        </Panel>
      </div>
    </div>
  );
}
