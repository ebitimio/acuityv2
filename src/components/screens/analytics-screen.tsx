"use client";

import { GlassSurface } from "@/components/ui/glass-surface";
import { BarPairChart } from "@/components/ui/bar-pair-chart";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CASHFLOW_DATA = [
  { label: "W1", income: 150000, expense: 45000 },
  { label: "W2", income: 0, expense: 32000 },
  { label: "W3", income: 850000, expense: 120000 },
  { label: "W4", income: 20000, expense: 85000 },
];

export function AnalyticsScreen() {
  return (
    <div className="min-h-screen bg-black pb-32">
      
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
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
              +₦174,480
            </h2>
            <span className="text-[13px] font-medium text-[var(--brand)] bg-[var(--brand)]/10 px-2 py-1 rounded-md mb-1">
              ↑ 111.5%
            </span>
          </div>

          {/* The Chart */}
          <BarPairChart data={CASHFLOW_DATA} />

          {/* Legend */}
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
          
          <div className="flex flex-col gap-4">
            {/* Category Row 1 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[18px]">🛒</div>
                <div>
                  <p className="text-[15px] font-medium text-white">Groceries</p>
                  <p className="text-[13px] text-white/50">12 transactions</p>
                </div>
              </div>
              <span className="text-[15px] font-semibold text-white tabular">₦145,000</span>
            </div>

            {/* Category Row 2 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[18px]">🚗</div>
                <div>
                  <p className="text-[15px] font-medium text-white">Transport</p>
                  <p className="text-[13px] text-white/50">24 transactions</p>
                </div>
              </div>
              <span className="text-[15px] font-semibold text-white tabular">₦45,500</span>
            </div>
            
            {/* Category Row 3 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[18px]">🍿</div>
                <div>
                  <p className="text-[15px] font-medium text-white">Subscriptions</p>
                  <p className="text-[13px] text-white/50">4 transactions</p>
                </div>
              </div>
              <span className="text-[15px] font-semibold text-white tabular">₦12,000</span>
            </div>
          </div>
        </GlassSurface>

      </div>

      {/* Period Pager (Pinned to bottom, above tab bar) */}
      <div className="fixed bottom-28 left-0 right-0 flex justify-center pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-4 bg-[#17191A] border border-white/10 rounded-full px-2 py-1.5">
          <button className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft size={20} className="text-white/70" />
          </button>
          <span className="text-[13px] font-medium text-white w-28 text-center">
            Budget: May 2026
          </span>
          <button className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <ChevronRight size={20} className="text-white/70" />
          </button>
        </div>
      </div>

    </div>
  );
}