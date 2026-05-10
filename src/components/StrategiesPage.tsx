import { Panel, Badge, TacticalButton, BunnyLogo } from "./ui/Tactical";
import { PERFORMANCE_MATRIX } from "../lib/data";
import { Sword, Zap, ShieldAlert, Binary, Rocket } from "lucide-react";
import { motion } from "motion/react";

export function StrategiesPage() {
  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-4 border-b border-white/5 pb-8">
        <h1 className="text-4xl font-black tracking-tight text-white uppercase">
          Protocol Analysis
        </h1>
        <p className="text-neutral-500 text-[10px] font-bold tracking-widest uppercase">
          Market dominance and adoption trends across the MegaETH ecosystem
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
         <div className="lg:col-span-8 space-y-8">
            <Panel title="Market Share Breakdown">
               <div className="grid grid-cols-1 gap-8">
                  {PERFORMANCE_MATRIX.map((strat, i) => (
                    <div key={strat.protocolName} className="group relative p-8 border border-white/5 bg-[#0a0a0a] hover:bg-white/5 transition-all">
                       <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-6">
                             <div className="text-4xl font-black text-white/5 italic font-serif leading-none">
                                0{i + 1}
                             </div>
                             <div>
                                <h3 className="text-xl font-bold uppercase tracking-tighter text-white group-hover:text-blue-500 transition-colors">
                                   {strat.protocolName}
                                </h3>
                                <div className="flex gap-2 mt-2">
                                  <Badge>{strat.category}</Badge>
                                  {strat.isTrending && <div className="px-2 py-0.5 text-[9px] font-bold text-blue-500 bg-blue-500/5 border border-blue-500/10 uppercase tracking-widest">Trending</div>}
                                </div>
                             </div>
                          </div>
                          <div className="text-right">
                             <div className="text-3xl font-bold text-white tracking-tighter">{strat.percentage}%</div>
                             <div className="text-[9px] text-neutral-600 uppercase tracking-widest font-bold">Adoption</div>
                          </div>
                       </div>
                       
                       <p className="max-w-xl text-sm text-neutral-400 font-medium leading-relaxed mb-8 uppercase text-[10px] tracking-wider opacity-60">
                          Monitoring show significant volume in {strat.protocolName} protocols. 
                          Growth trends indicate strong user retention in this sector.
                       </p>

                       <div className="flex items-center gap-12">
                          <div className="flex-1 h-[1px] bg-white/5" />
                          <div className="flex gap-4">
                             <Badge type="success">Growth Stable</Badge>
                             <Badge>Verified</Badge>
                          </div>
                       </div>

                       <div className="absolute right-0 bottom-0 left-0 h-1 overflow-hidden opacity-20">
                          <motion.div 
                            initial={{ x: "-100%" }}
                            animate={{ x: "0%" }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            className="w-full h-full bg-blue-500"
                            style={{ opacity: strat.percentage / 100 }}
                          />
                       </div>
                    </div>
                  ))}
               </div>
            </Panel>
         </div>

         <div className="lg:col-span-4 space-y-12">
            <div className="space-y-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-blue-500 block">Ecosystem Insights</span>
              <div className="space-y-8">
                  <div className="flex gap-4 pb-6 border-b border-white/5">
                     <ShieldAlert size={20} className="text-white/10 shrink-0" />
                     <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Bridge Activity</span>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">RabbitHole bridge volume is increasing. Monitoring for potential incentives.</p>
                     </div>
                  </div>
                  <div className="flex gap-4 pb-6 border-b border-white/5">
                     <Zap size={20} className="text-blue-500 shrink-0 opacity-50" />
                     <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Lending Markets</span>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">Teko Finance supply APYs are stabilizing after recent pool adjustments.</p>
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
