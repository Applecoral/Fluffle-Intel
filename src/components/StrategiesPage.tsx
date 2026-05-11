import { Panel, Badge, TacticalButton, BunnyLogo } from "./ui/Tactical";
import { PERFORMANCE_MATRIX } from "../lib/data";
import { Sword, Zap, ShieldAlert, Binary, Rocket } from "lucide-react";
import { motion } from "motion/react";

export function StrategiesPage() {
  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-4 border-b border-white/5 pb-8">
        <h1 className="text-4xl font-black tracking-tight text-white uppercase">
          Protocol Usage
        </h1>
        <p className="text-neutral-500 text-[10px] font-bold tracking-widest uppercase">
          Ecosystem-wide interaction patterns and dominance metrics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
         <div className="lg:col-span-8 space-y-8">
            <Panel title="Protocol Popularity Breakdown">
               <div className="grid grid-cols-1 gap-6">
                  {PERFORMANCE_MATRIX.map((item, index) => (
                    <div key={item.protocolName} className="p-6 border border-white/5 bg-black/40 group hover:border-blue-500/30 transition-all">
                       <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-4">
                             <div className="text-2xl font-black text-white/10 italic">0{index + 1}</div>
                             <div>
                                <h3 className="text-lg font-bold text-white uppercase tracking-tight group-hover:text-blue-500 transition-all">{item.protocolName}</h3>
                                <div className="flex gap-2 mt-1">
                                   <Badge>{item.category}</Badge>
                                   {item.isTrending && <Badge type="success">Trending</Badge>}
                                </div>
                             </div>
                          </div>
                          <div className="text-right">
                             <div className="text-2xl font-black text-white tracking-tighter">{item.percentage}%</div>
                             <div className="text-[10px] text-neutral-600 uppercase font-black">Share</div>
                          </div>
                       </div>
                       
                       <div className="w-full h-1 bg-white/5 relative overflow-hidden">
                          <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${item.percentage}%` }}
                             transition={{ duration: 1, delay: index * 0.1 }}
                             className="absolute inset-0 bg-blue-500"
                          />
                       </div>
                       
                       <div className="mt-4 flex justify-between items-center text-[10px] text-neutral-500 font-mono uppercase">
                          <span>Verified usage: {item.usageCount.toLocaleString()} events</span>
                          <span>Signal Strength: High</span>
                       </div>
                    </div>
                  ))}
               </div>
            </Panel>
         </div>

         <div className="lg:col-span-4 space-y-12">
            <div className="space-y-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-blue-500 block">Usage Insights</span>
              <div className="p-8 border border-white/5 bg-black/40 space-y-6">
                  <div className="flex gap-4">
                     <Zap size={16} className="text-blue-500 shrink-0" />
                     <div className="space-y-1">
                        <p className="text-[10px] text-white font-bold uppercase tracking-widest">Lending Dominance</p>
                        <p className="text-[11px] text-neutral-500 leading-relaxed uppercase">Teko Finance maintaining {'>'}40% share of lending interactions.</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <ShieldAlert size={16} className="text-orange-500 shrink-0" />
                     <div className="space-y-1">
                        <p className="text-[10px] text-white font-bold uppercase tracking-widest">Bridging Frequency</p>
                        <p className="text-[11px] text-neutral-500 leading-relaxed uppercase">Mainnet bridge volume increasing as farmers scale operations.</p>
                     </div>
                  </div>
              </div>
            </div>

            <Panel title="Tools">
               <div className="flex flex-col gap-4">
                  <TacticalButton className="w-full" icon={<Rocket size={14} />}>
                     Simulate Flow
                  </TacticalButton>
                  <TacticalButton className="w-full !bg-white/5 !text-neutral-500 !border-white/10" icon={<Binary size={14} />}>
                     Download Data
                  </TacticalButton>
               </div>
            </Panel>
         </div>
      </div>
      <div className="mt-20 border-t border-white/5 pt-20 flex flex-col items-center gap-8">
        <div className="flex items-center gap-8 opacity-20 hover:opacity-50 transition-opacity">
           <BunnyLogo sickle className="scale-150 rotate-[-15deg]" />
           <div className="h-12 w-[1px] bg-white/10" />
           <BunnyLogo className="scale-150 rotate-[15deg]" />
        </div>
        <p className="text-[10px] font-bold text-neutral-700 uppercase tracking-[0.4em]">Farming Securely on MegaETH Mainnet</p>
      </div>
    </div>
  );
}
