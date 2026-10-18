"use client";

import { GlassSurface } from "./glass-surface";
import { ChevronDown, PieChart, Wallet } from "lucide-react";

interface TopBarProps {
  onBudgetClick: () => void;
  onAnalyticsClick: () => void;
  onCurrencyToggle: () => void;
  onSettingsClick: () => void;
  baseCurrency: string;
}

export function TopBar({ 
  onBudgetClick, 
  onAnalyticsClick, 
  onCurrencyToggle,
  onSettingsClick,
  baseCurrency 
}: TopBarProps) {
  return (
    <div className="sticky top-0 left-0 right-0 z-[70] flex justify-center pt-4 pb-2 px-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md flex items-center justify-between">
        
        <button 
          onClick={onSettingsClick}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[var(--brand)] to-[#0e5a2b] flex items-center justify-center text-[10px] font-bold text-white">
            A
          </div>
          <span className="text-[13px] font-medium text-white">Home</span>
          <ChevronDown size={14} className="text-white/60" />
        </button>

        <div className="flex items-center gap-2">
          <button 
            onClick={onCurrencyToggle}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <span className="text-[13px] font-medium text-[var(--brand)]">
              {baseCurrency === "NGN" ? "₦" : "$"}
            </span>
            <span className="text-[13px] font-medium text-white">
              {baseCurrency === "NGN" ? "1,450" : "1"}
            </span>
          </button>

          <button onClick={onBudgetClick} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10">
            <Wallet size={16} className="text-white" />
          </button>

          <button onClick={onAnalyticsClick} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10">
            <PieChart size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}