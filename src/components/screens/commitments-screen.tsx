"use client";

import { GlassSurface } from "@/components/ui/glass-surface";
import { ChevronLeft, ShieldAlert, Users, Plus, CalendarDays, Wallet } from "lucide-react";

export function CommitmentsScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-[100dvh] bg-black pb-32">
      
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft size={24} className="text-white" />
          </button>
          <h1 className="text-[17px] font-semibold text-white">Commitments</h1>
        </div>
        <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
          <Plus size={20} className="text-white" />
        </button>
      </div>

      <div className="px-6 pt-6 flex flex-col gap-8">
        
        {/* Recurring Bills */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[15px] font-semibold text-white">Recurring Bills</h3>
            <span className="text-[13px] text-white/50">This Month</span>
          </div>
          
          <GlassSurface tier="regular" radius={24} className="p-8 text-center flex flex-col items-center justify-center">
            <CalendarDays size={32} className="text-white/20 mb-3" />
            <p className="text-[15px] text-white/60">No recurring bills yet.</p>
            <button className="mt-3 text-[13px] text-[var(--brand)] font-medium">Add a bill</button>
          </GlassSurface>
        </section>

        {/* Sinking Funds */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[15px] font-semibold text-white">Sinking Funds</h3>
            <button className="text-[13px] text-[var(--brand)] font-medium">Manage</button>
          </div>
          
          <GlassSurface tier="regular" radius={24} className="p-8 text-center flex flex-col items-center justify-center">
            <Wallet size={32} className="text-white/20 mb-3" />
            <p className="text-[15px] text-white/60">No sinking funds yet.</p>
            <button className="mt-3 text-[13px] text-[var(--brand)] font-medium">Create a fund</button>
          </GlassSurface>
        </section>

        {/* Black Tax Envelope */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[15px] font-semibold text-white">Family Support (Black Tax)</h3>
            <Users size={16} className="text-white/50" />
          </div>

          <GlassSurface tier="thick" radius={24} className="p-6 text-center">
            <p className="text-[15px] text-white/60 mb-4">No family support allocation set yet.</p>
            <button className="px-6 py-2 bg-[var(--brand)] text-black font-semibold rounded-full text-[14px]">
              Set Allocation
            </button>
          </GlassSurface>
        </section>

      </div>
    </div>
  );
}