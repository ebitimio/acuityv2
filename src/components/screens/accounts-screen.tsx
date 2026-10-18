"use client";

import { GlassSurface } from "@/components/ui/glass-surface";
import { NumberRoll } from "@/components/ui/number-roll";
import { AccountCard } from "@/components/ui/account-card";
import { ChevronLeft, Plus, Shield } from "lucide-react";

const MOCK_ACCOUNTS = [
  { id: "1", name: "Main Checking", institution: "GTBank", balance: 1250430, lastImported: "May 2", color: "#FF9F0A", icon: "🏦" },
  { id: "2", name: "Savings Vault", institution: "Kuda", balance: 450000, lastImported: "May 1", color: "#30D158", icon: "🛡️" },
  { id: "3", name: "USD Domiciliary", institution: "Stanbic IBTC", balance: 12050, lastImported: "Apr 28", color: "#64D2FF", icon: "💵", currency: "$" },
  { id: "4", name: "OPay Wallet", institution: "OPay", balance: 45200, lastImported: "May 3", color: "#AF52DE", icon: "📱" },
];

export function AccountsScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-black pb-32">
      
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft size={24} className="text-white" />
          </button>
          <h1 className="text-[17px] font-semibold text-white">Accounts</h1>
        </div>
        <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
          <Plus size={20} className="text-white" />
        </button>
      </div>

      <div className="px-6 pt-6 flex flex-col gap-6">
        
        {/* Total Wealth Summary Card */}
        <GlassSurface tier="thick" radius={28} className="p-6 text-center relative overflow-hidden">
           {/* Subtle glow behind the number */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[var(--brand)]/20 blur-[60px] rounded-full pointer-events-none" />
          
          <p className="text-[13px] text-white/60 mb-2">Total Liquid Assets</p>
          <div className="text-[34px] font-bold text-white tracking-tight">
            <NumberRoll value={1745680} currency="₦" />
          </div>
          <p className="text-[13px] text-[var(--brand)] mt-2 font-medium">↑ 2.4% this month</p>
        </GlassSurface>

        {/* Account List */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[15px] font-semibold text-white">Connected Accounts</h3>
            <span className="text-[13px] text-white/50">{MOCK_ACCOUNTS.length} total</span>
          </div>

          <div className="flex flex-col gap-3">
            {MOCK_ACCOUNTS.map((account) => (
              <AccountCard 
                key={account.id}
                name={account.name}
                institution={account.institution}
                balance={account.balance}
                currency={account.currency}
                lastImported={account.lastImported}
                color={account.color}
                icon={account.icon}
              />
            ))}
          </div>
        </div>

        {/* Offline Assets & Liabilities (Mini Cards) */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <GlassSurface tier="thin" radius={20} className="p-4 flex flex-col gap-2">
            <span className="text-[13px] text-white/60">Offline Assets</span>
            <span className="text-[17px] font-semibold text-white tabular">₦12,500,000</span>
            <span className="text-[12px] text-white/40">Land, Vehicles</span>
          </GlassSurface>
          
          <GlassSurface tier="thin" radius={20} className="p-4 flex flex-col gap-2">
            <span className="text-[13px] text-white/60">Liabilities</span>
            <span className="text-[17px] font-semibold text-[var(--danger)] tabular">-₦1,200,000</span>
            <span className="text-[12px] text-white/40">Car Loan</span>
          </GlassSurface>
        </div>

      </div>
    </div>
  );
}