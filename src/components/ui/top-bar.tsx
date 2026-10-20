"use client";

import { ChevronDown, PieChart, Wallet } from "lucide-react";

interface TopBarProps {
  onBudgetClick: () => void;
  onAnalyticsClick: () => void;
  onSettingsClick: () => void;
}

export function TopBar({ 
  onBudgetClick, 
  onAnalyticsClick, 
  onSettingsClick,
}: TopBarProps) {
  return (
    <div className="sticky top-0 left-0 right-0 z-[70] flex justify-center pt-4 pb-2 px-4 bg-[var(--scrim)] backdrop-blur-md">
      <div className="w-full max-w-md flex items-center justify-between">
        
        <button 
          onClick={onSettingsClick}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-[var(--fill-1)] border border-[var(--line)] hover:bg-[var(--fill-2)] transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[var(--brand)] to-[#0e5a2b] flex items-center justify-center text-[10px] font-bold text-[var(--text-1)]">
            A
          </div>
          <span className="text-[13px] font-medium text-[var(--text-1)]">Home</span>
          <ChevronDown size={14} className="text-[var(--text-2)]" />
        </button>

        <div className="flex items-center gap-2">
          <button onClick={onBudgetClick} className="w-9 h-9 rounded-full bg-[var(--fill-1)] border border-[var(--line)] flex items-center justify-center hover:bg-[var(--fill-2)]">
            <Wallet size={16} className="text-[var(--text-1)]" />
          </button>

          <button onClick={onAnalyticsClick} className="w-9 h-9 rounded-full bg-[var(--fill-1)] border border-[var(--line)] flex items-center justify-center hover:bg-[var(--fill-2)]">
            <PieChart size={16} className="text-[var(--text-1)]" />
          </button>
        </div>
      </div>
    </div>
  );
}