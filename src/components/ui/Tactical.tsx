import { ReactNode } from "react";
import { motion } from "motion/react";

interface PanelProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Panel({ title, children, className = "" }: PanelProps) {
  return (
    <div className={`bg-[#0c0c0c] border border-white/10 relative overflow-hidden ${className}`}>
      {title && (
        <div className="border-b border-white/10 bg-[#0c0c0c] px-4 py-2 flex justify-between items-center">
          <span className="text-[9px] font-sans font-bold uppercase tracking-[0.3em] text-blue-500">
            {title}
          </span>
          <div className="flex gap-1.5">
            <div className="w-[1px] h-3 bg-white/10 rotate-12" />
          </div>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

interface TacticalButtonProps {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
  className?: string;
  icon?: ReactNode;
  key?: string | number;
}

export function TacticalButton({ children, onClick, active, className = "", icon }: TacticalButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        group relative px-8 py-4 font-sans text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-300
        ${active 
          ? "bg-white text-black" 
          : "bg-transparent text-white/60 hover:text-white border border-white/10 hover:bg-white/5"
        }
        ${className}
      `}
    >
      <div className="flex items-center justify-center gap-3">
        {icon && <span className={`${active ? "text-black" : "text-blue-500"} opacity-70`}>{icon}</span>}
        {children}
      </div>
      
      {/* Accent dot */}
      {active && <div className="absolute top-2 right-2 w-1 h-1 bg-blue-500 rounded-full" />}
    </button>
  );
}

export function Badge({ children, type = "default" }: { children: ReactNode; type?: "default" | "success" | "error" | "warning" }) {
  const colors = {
    default: "bg-white/5 text-neutral-400 border-white/10",
    success: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    error: "bg-red-500/10 text-red-500 border-red-500/20",
    warning: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  };

  return (
    <span className={`px-2 py-0.5 text-[9px] font-sans font-bold uppercase tracking-widest border transition-colors ${colors[type]}`}>
      {children}
    </span>
  );
}

export function BunnyLogo({ className = "" }: { className?: string }) {
  return (
    <pre className={`text-[#00ff85] font-mono leading-none ${className}`}>
{`  (\\(\\
  ( -.-)
  o_(")(")`}
    </pre>
  );
}
