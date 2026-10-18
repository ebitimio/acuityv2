"use client";

import { GlassSurface } from "@/components/ui/glass-surface";
import { ChevronLeft, ShieldCheck, Search } from "lucide-react";

export function BankChargeScreen({ onBack }: { onBack: () => void }) {
  const totalOvercharged = 0;
  const auditResults: any[] = [];

  return (
    <div className="min-h-[100dvh] bg-black pb-32">
      
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft size={24} className="text-white" />
          </button>
          <h1 className="text-[17px] font-semibold text-white">Bank Charge Auditor</h1>
        </div>
        <Search size={20} className="text-white/50" />
      </div>

      <div className="px-6 pt-6 flex flex-col gap-6">
        
        {/* Hero Stat */}
        <GlassSurface tier="thick" radius={28} className="p-6 relative overflow-hidden text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[var(--brand)]/10 blur-[60px] rounded-full pointer-events-none" />
          
          <p className="text-[13px] text-white/60 mb-2">Potential Overcharges Found</p>
          <p className="text-[40px] font-bold text-[var(--brand)] tracking-tight tabular">₦0</p>
          <p className="text-[13px] text-white/50 mt-2">Based on CBN fee rules for May 2026</p>
        </GlassSurface>

        {/* Audit Results */}
        <div>
          <h3 className="text-[15px] font-semibold text-white mb-3 px-1">Audit Results</h3>
          
          {auditResults.length === 0 ? (
            <GlassSurface tier="thin" radius={24} className="p-10 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--brand)]/20 flex items-center justify-center mb-3">
                <ShieldCheck size={24} className="text-[var(--brand)]" />
              </div>
              <p className="text-[15px] font-medium text-white mb-1">All Clear!</p>
              <p className="text-[13px] text-white/50">
                No overcharges detected. Your bank is complying with CBN fee regulations.
              </p>
            </GlassSurface>
          ) : (
            <GlassSurface tier="thin" radius={24} className="flex flex-col p-2">
              {/* Render results here if you add them later */}
            </GlassSurface>
          )}
        </div>

      </div>
    </div>
  );
}