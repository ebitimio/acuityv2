"use client";

import { GlassSurface } from "@/components/ui/glass-surface";
import { ChevronLeft, Users, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

const AJO_GROUP = {
  name: "Lagos Island Professionals",
  type: "Ajo / Esusu",
  contribution: 50000,
  cadence: "Monthly",
  members: 10,
  myPosition: 4,
  nextPayoutDate: "Aug 1, 2026",
  projectedPayout: 500000,
};

const CONTRIBUTIONS = [
  { month: "May 2026", status: "paid", date: "May 1" },
  { month: "Jun 2026", status: "upcoming", date: "Jun 1" },
  { month: "Jul 2026", status: "upcoming", date: "Jul 1" },
  { month: "Aug 2026", status: "upcoming", date: "Aug 1" },
];

export function AjoScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-black pb-32">
      
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft size={24} className="text-white" />
          </button>
          <h1 className="text-[17px] font-semibold text-white">Ajo Tracker</h1>
        </div>
        <span className="text-[13px] font-medium text-white/50 bg-white/10 px-3 py-1 rounded-full">
          {AJO_GROUP.type}
        </span>
      </div>

      <div className="px-6 pt-6 flex flex-col gap-6">
        
        {/* Group Card */}
        <GlassSurface tier="thick" radius={28} className="p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand)]/10 blur-[50px] rounded-full pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <p className="text-[15px] font-medium text-white">{AJO_GROUP.name}</p>
              <p className="text-[12px] text-white/50">{AJO_GROUP.members} members · {AJO_GROUP.cadence} contributions</p>
            </div>
          </div>

          <div className="flex justify-between items-center bg-white/5 rounded-2xl p-4">
            <div>
              <p className="text-[12px] text-white/60 mb-1">Contribution</p>
              <p className="text-[17px] font-semibold text-white tabular">₦{AJO_GROUP.contribution.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-white/60 mb-1">My Payout</p>
              <p className="text-[17px] font-semibold text-[var(--brand)] tabular">₦{AJO_GROUP.projectedPayout.toLocaleString()}</p>
            </div>
          </div>
        </GlassSurface>

        {/* Payout Turn */}
        <div>
          <h3 className="text-[15px] font-semibold text-white mb-3 px-1">My Payout Turn</h3>
          <GlassSurface tier="regular" radius={24} className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[13px] text-white/60 mb-1">Position</p>
                <p className="text-[24px] font-bold text-white">#{AJO_GROUP.myPosition} <span className="text-[14px] text-white/50 font-normal">of {AJO_GROUP.members}</span></p>
              </div>
              <div className="text-right">
                <p className="text-[13px] text-white/60 mb-1">Expected Date</p>
                <p className="text-[15px] font-medium text-[var(--brand)]">{AJO_GROUP.nextPayoutDate}</p>
              </div>
            </div>
            
            {/* Progress dots */}
            <div className="flex justify-between items-center px-2">
              {Array.from({ length: AJO_GROUP.members }).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-3 h-3 rounded-full ${
                    i < AJO_GROUP.myPosition 
                      ? "bg-[var(--brand)]" 
                      : i === AJO_GROUP.myPosition - 1
                      ? "bg-[var(--brand)] ring-4 ring-[var(--brand)]/20"
                      : "bg-white/10"
                  }`} 
                />
              ))}
            </div>
          </GlassSurface>
        </div>

        {/* Contribution Schedule */}
        <div>
          <h3 className="text-[15px] font-semibold text-white mb-3 px-1">Schedule</h3>
          <GlassSurface tier="thin" radius={24} className="flex flex-col p-2">
            {CONTRIBUTIONS.map((contribution) => (
              <div key={contribution.month} className="flex items-center justify-between p-3 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    contribution.status === "paid" ? "bg-[var(--brand)]/20 text-[var(--brand)]" : "bg-white/5 text-white/40"
                  }`}>
                    {contribution.status === "paid" ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                  </div>
                  <div>
                    <p className="text-[15px] font-medium text-white">{contribution.month}</p>
                    <p className="text-[12px] text-white/50">{contribution.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-[15px] font-semibold tabular ${contribution.status === "paid" ? "text-white" : "text-white/50"}`}>
                    ₦{AJO_GROUP.contribution.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-white/40 capitalize">{contribution.status}</p>
                </div>
              </div>
            ))}
          </GlassSurface>
        </div>

        {/* Pay Button (if needed) */}
        {CONTRIBUTIONS.find(c => c.status === "upcoming") && (
          <button className="w-full flex items-center justify-center gap-2 py-4 bg-[var(--brand)] text-black rounded-full font-semibold text-[17px] active:scale-[0.98] transition-transform mt-2">
            Pay Next Contribution
          </button>
        )}

      </div>
    </div>
  );
}