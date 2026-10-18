"use client";

import { GlassSurface } from "@/components/ui/glass-surface";
import { ChevronLeft, ShieldAlert, CheckCircle, Search } from "lucide-react";

const AUDIT_RESULTS = [
  { id: "1", date: "May 3", description: "Electronic Transfer Levy (ETL)", amount: 50, expected: 50, status: "correct" },
  { id: "2", date: "May 3", description: "Stamp Duty", amount: 50, expected: 0, status: "overcharge", note: "Stamp duty should not be charged on credits below ₦10,000" },
  { id: "3", date: "May 5", description: "SMS Alert Fee", amount: 4, expected: 4, status: "correct" },
  { id: "4", date: "May 8", description: "Card Maintenance Fee", amount: 500, expected: 500, status: "correct" },
  { id: "5", date: "May 12", description: "Duplicate ETL Charge", amount: 50, expected: 0, status: "overcharge", note: "You were charged ETL twice on the same transaction" },
];

export function BankChargeScreen({ onBack }: { onBack: () => void }) {
  const totalOvercharged = AUDIT_RESULTS
    .filter(r => r.status === "overcharge")
    .reduce((sum, r) => sum + (r.amount - r.expected), 0);

  return (
    <div className="min-h-screen bg-black pb-32">
      
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
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[var(--danger)]/10 blur-[60px] rounded-full pointer-events-none" />
          
          <p className="text-[13px] text-white/60 mb-2">Potential Overcharges Found</p>
          <p className="text-[40px] font-bold text-[var(--danger)] tracking-tight tabular">₦{totalOvercharged.toLocaleString()}</p>
          <p className="text-[13px] text-white/50 mt-2">Based on CBN fee rules for May 2026</p>
        </GlassSurface>

        {/* Audit Results */}
        <div>
          <h3 className="text-[15px] font-semibold text-white mb-3 px-1">Audit Results</h3>
          
          <GlassSurface tier="thin" radius={24} className="flex flex-col p-2">
            {AUDIT_RESULTS.map((result) => (
              <div key={result.id} className="flex flex-col p-4 border-b border-white/5 last:border-0 gap-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      result.status === "overcharge" ? "bg-[var(--danger)]/20" : "bg-[var(--brand)]/20"
                    }`}>
                      {result.status === "overcharge" ? (
                        <ShieldAlert size={16} className="text-[var(--danger)]" />
                      ) : (
                        <CheckCircle size={16} className="text-[var(--brand)]" />
                      )}
                    </div>
                    <div>
                      <p className="text-[15px] font-medium text-white">{result.description}</p>
                      <p className="text-[12px] text-white/50">{result.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[15px] font-semibold text-white tabular">₦{result.amount}</p>
                    {result.status === "overcharge" && (
                      <p className="text-[11px] text-[var(--danger)] font-medium">Overcharge</p>
                    )}
                  </div>
                </div>
                {result.note && (
                  <p className="text-[12px] text-[var(--danger)]/80 ml-11 bg-[var(--danger)]/5 p-2 rounded-lg">
                    {result.note}
                  </p>
                )}
              </div>
            ))}
          </GlassSurface>
        </div>

        {/* Action Button */}
        {totalOvercharged > 0 && (
          <button className="w-full flex items-center justify-center gap-2 py-4 bg-white text-black rounded-full font-semibold text-[17px] active:scale-[0.98] transition-transform">
            Generate Dispute Letter
          </button>
        )}

      </div>
    </div>
  );
}