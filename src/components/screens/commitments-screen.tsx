"use client";

import { GlassSurface } from "@/components/ui/glass-surface";
import { ChevronLeft, ShieldAlert, Users, Plus } from "lucide-react";

const RECURRING_BILLS = [
  { id: "1", name: "Netflix Premium", amount: 4500, currency: "₦", due: "May 12", account: "USD Dom", icon: "🍿", fxWarning: false },
  { id: "2", name: "ChatGPT Plus", amount: 20, currency: "$", due: "May 15", account: "USD Dom", icon: "🤖", fxWarning: true },
  { id: "3", name: "Internet - Starlink", amount: 38000, currency: "₦", due: "May 20", account: "GTBank", icon: "🛰️", fxWarning: false },
];

const SINKING_FUNDS = [
  { id: "1", name: "Annual Rent", target: 2500000, saved: 850000, due: "Dec 2026", icon: "🏠" },
  { id: "2", name: "School Fees", target: 800000, saved: 600000, due: "Sep 2026", icon: "🎓" },
];

export function CommitmentsScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-black pb-32">
      
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
          
          <GlassSurface tier="regular" radius={24} className="flex flex-col p-2">
            {RECURRING_BILLS.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between p-3 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[18px]">
                    {bill.icon}
                  </div>
                  <div>
                    <p className="text-[15px] font-medium text-white">{bill.name}</p>
                    <p className="text-[12px] text-white/50">Due {bill.due} · {bill.account}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[15px] font-semibold text-white tabular">
                    {bill.currency}{bill.amount.toLocaleString()}
                  </span>
                  {bill.fxWarning && (
                    <div className="w-6 h-6 rounded-full bg-[var(--warn)]/20 flex items-center justify-center" title="Low USD balance">
                      <ShieldAlert size={12} className="text-[var(--warn)]" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </GlassSurface>
        </section>

        {/* Sinking Funds */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[15px] font-semibold text-white">Sinking Funds</h3>
            <button className="text-[13px] text-[var(--brand)] font-medium">Manage</button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {SINKING_FUNDS.map((fund) => {
              const percentage = Math.round((fund.saved / fund.target) * 100);
              return (
                <GlassSurface key={fund.id} tier="thin" radius={20} className="p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[16px]">
                      {fund.icon}
                    </div>
                    <span className="text-[11px] font-medium text-white/50">{percentage}%</span>
                  </div>
                  
                  <div>
                    <p className="text-[14px] font-medium text-white mb-0.5">{fund.name}</p>
                    <p className="text-[11px] text-white/40">Due {fund.due}</p>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-[var(--brand)] rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  <p className="text-[12px] text-white/70 tabular">
                    ₦{fund.saved.toLocaleString()} <span className="text-white/40">of ₦{fund.target.toLocaleString()}</span>
                  </p>
                </GlassSurface>
              );
            })}
          </div>
        </section>

        {/* Black Tax Envelope */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[15px] font-semibold text-white">Family Support (Black Tax)</h3>
            <Users size={16} className="text-white/50" />
          </div>

          <GlassSurface tier="thick" radius={24} className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[13px] text-white/60 mb-1">Monthly Allocation</p>
                <p className="text-[24px] font-bold text-white tabular">₦150,000</p>
              </div>
              <div className="text-right">
                <p className="text-[13px] text-white/60 mb-1">Used</p>
                <p className="text-[17px] font-semibold text-[var(--warn)] tabular">₦95,000</p>
              </div>
            </div>
            
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-[var(--warn)] rounded-full" style={{ width: "63%" }} />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-[13px] text-white/50">Remaining: ₦55,000</p>
              <button className="text-[13px] font-medium text-white bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition-colors">
                Log Remittance
              </button>
            </div>
          </GlassSurface>
        </section>

      </div>
    </div>
  );
}