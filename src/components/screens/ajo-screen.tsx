"use client";

import { GlassSurface } from "@/components/ui/glass-surface";
import { ChevronLeft, Users, Plus } from "lucide-react";

export function AjoScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-[100dvh] bg-black pb-32">
      
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft size={24} className="text-white" />
          </button>
          <h1 className="text-[17px] font-semibold text-white">Ajo Tracker</h1>
        </div>
        <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
          <Plus size={20} className="text-white" />
        </button>
      </div>

      <div className="px-6 pt-6 flex flex-col gap-6">
        
        <GlassSurface tier="thick" radius={28} className="p-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Users size={32} className="text-white/40" />
          </div>
          <h2 className="text-[17px] font-semibold text-white mb-2">No Ajo Groups Yet</h2>
          <p className="text-[14px] text-white/50 mb-6">
            Track your rotating savings, thrift contributions, and cooperative groups here.
          </p>
          <button className="px-6 py-3 bg-[var(--brand)] text-black font-semibold rounded-full text-[15px]">
            Create a Group
          </button>
        </GlassSurface>

      </div>
    </div>
  );
}