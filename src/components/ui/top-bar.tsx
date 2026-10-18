"use client";

import { GlassSurface } from "./glass-surface";
import { ChevronDown, PieChart, Wallet } from "lucide-react";

interface TopBarProps {
  onBudgetClick: () => void;
  onAnalyticsClick: () => void;
  onCurrencyToggle: () => void;
  onSettingsClick: () => void; // NEW
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
    <div className="absolute top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 pointer-events-none">
      <div className="w-full max-w-md flex items-center justify-between pointer-events-auto">
        
        {/* Workspace Switcher -> Now opens settings */}
        <button 
          onClick={onSettingsClick}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[var(--brand)] to-[#0e5a2b] flex items-center justify-center text-[10px] font-bold text-white">
            A
          </div>
          <span className="text-[13px] font-medium text-white">Home</span>
          <ChevronDown size={14} className="text-white/60" />
        </button>

        {/* Right Side Pills */}
        <div className="flex items-center gap-2">
          {/* FX Pill */}
          <button 
            onClick={onCurrencyToggle}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-colors"
          >
            <span className="text-[13px] font-medium text-[var(--brand)]">
              {baseCurrency === "NGN" ? "₦" : "$"}
            </span>
            <span className="text-[13px] font-medium text-white">
              {baseCurrency === "NGN" ? "1,450" : "1"}
            </span>
          </button>

          <button 
            onClick={onBudgetClick}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <Wallet size={16} className="text-white" />
          </button>

          <button 
            onClick={onAnalyticsClick}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <PieChart size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}