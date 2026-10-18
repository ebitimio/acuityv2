"use client";

import { GlassSurface } from "@/components/ui/glass-surface";
import { BarPairChart } from "@/components/ui/bar-pair-chart";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function AnalyticsScreen() {
  // Empty data for new users
  const cashflowData = [
    { label: "W1", income: 0, expense: 0 },
    { label: "W2", income: 0, expense: 0 },
    { label: "W3", income: 0, expense: 0 },
    { label: "W4", income: 0, expense: 0 },
  ];

  return (
    <div className="min-h-[100dvh] bg-black pb-32 pt-16">
      
      {/* Header */}
      <div className="fixed top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 w-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft size={24} className="text-white" />
          </button>
          <h1 className="text-[17px] font-semibold text-white">Analytics</h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[11px] text-white/70">
          All
        </div>
      </div>

      <div className="px-6 pt-6 flex flex-col gap-6">
        
        {/* Cashflow Card */}
        <GlassSurface tier="thick" radius={28} className="p-6">
          <p className="text-[13px] text-white/60 mb-1">Cashflow</p>
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-[34px] font-bold text-[var(--brand)] tracking-tight">
              +₦0.00
            </h2>
            <span className="text-[13px] font-medium text-[var(--brand)] bg-[var(--brand)]/10 px-2 py-1 rounded-md mb-1">
              0%
            </span>
          </div>

          <BarPairChart data={cashflowData} />

          <div className="flex items-center gap-6 mt-6 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--brand)]" />
              <span className="text-[13px] text-white/70">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
              <span className="text-[13px] text-white/70">Spending</span>
            </div>
          </div>
        </GlassSurface>

        {/* Spending Breakdown Card */}
        <GlassSurface tier="regular" radius={28} className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[17px] font-semibold text-white">Spending by Category</h3>
            <button className="text-[13px] text-[var(--brand)] font-medium">See all</button>
          </div>
          
          <div className="text-center py-10 text-white/40 text-sm">
            No spending data yet.
          </div>
        </GlassSurface>

      </div>
    </div>
  );
}