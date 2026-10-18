"use client";

import { GlassSurface } from "@/components/ui/glass-surface";
import { GaugeArc } from "@/components/ui/gauge-arc";
import { ChevronLeft, Pencil, Trash2, Plus } from "lucide-react";

export function BudgetScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-black pb-32">
      
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft size={24} className="text-white" />
          </button>
          <h1 className="text-[17px] font-semibold text-white">Budget</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <Pencil size={16} className="text-white" />
          </button>
          <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <Trash2 size={16} className="text-danger" />
          </button>
        </div>
      </div>

      <div className="px-6 pt-6 flex flex-col gap-6">
        
        {/* AI Insight Line */}
        <div className="flex items-start gap-2 px-1">
          <span className="text-[var(--brand)] mt-0.5">✨</span>
          <p className="text-[14px] text-white/80 leading-snug">
            Well under pace. You've built a strong cushion.
          </p>
        </div>

        {/* Main Budget Card */}
        <GlassSurface tier="thick" radius={32} className="p-6 flex flex-col items-center">
          
          {/* Period */}
          <div className="w-full flex justify-between items-center mb-4 text-[13px] text-white/60">
            <span>Monthly · May 1 – May 31</span>
            <span>Days left: 20</span>
          </div>

          {/* Gauge */}
          <GaugeArc percentage={4} />

          {/* Remaining */}
          <div className="text-center mt-4 mb-6">
            <p className="text-[13px] text-white/60 mb-1">Left to spend</p>
            <p className="text-[28px] font-semibold text-white tabular">₦7,624.48</p>
          </div>

          {/* Footer Info */}
          <div className="w-full flex justify-between items-center pt-4 border-t border-white/10 text-[13px]">
            <div>
              <p className="text-white/50 mb-1">Amount</p>
              <p className="font-medium text-white tabular">₦8,000</p>
            </div>
            <div className="text-right">
              <p className="text-white/50 mb-1">Left to allocate</p>
              <p className="font-medium text-white tabular">₦5,900</p>
            </div>
          </div>
        </GlassSurface>

        {/* Category Budgets */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[15px] font-semibold text-white">Category budgets</h3>
            <button className="text-[13px] text-[var(--brand)] font-medium">Manage</button>
          </div>

          <GlassSurface tier="thin" radius={24} className="p-2 flex flex-col gap-1">
            
            {/* Category 1 */}
            <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[18px]">
                  🛒
                </div>
                <div>
                  <p className="text-[15px] font-medium text-white">Groceries</p>
                  <p className="text-[12px] text-white/50">₦871.47 left of ₦1,200</p>
                </div>
              </div>
              {/* Progress Ring (Small) */}
              <div className="w-8 h-8 rounded-full border-2 border-[var(--brand)]/30 border-t-[var(--brand)] flex items-center justify-center">
                 <span className="text-[10px] font-bold text-white/70">27%</span>
              </div>
            </div>

            {/* Category 2 */}
            <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[18px]">
                  🍔
                </div>
                <div>
                  <p className="text-[15px] font-medium text-white">Food Delivery</p>
                  <p className="text-[12px] text-white/50">₦840 left of ₦900</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-[var(--warn)]/30 border-t-[var(--warn)] flex items-center justify-center">
                 <span className="text-[10px] font-bold text-white/70">6%</span>
              </div>
            </div>

          </GlassSurface>
          
          {/* Add Button */}
          <button className="w-full mt-3 flex items-center gap-3 p-4 bg-[#17191A] border border-white/5 rounded-2xl group hover:bg-[#1A1C1D] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <Plus size={20} className="text-white/60 group-hover:text-white" />
            </div>
            <div className="text-left">
              <p className="text-[15px] font-medium text-white">Add category budget</p>
              <p className="text-[12px] text-white/50">₦5,900 available to allocate</p>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}