"use client";

import { useEffect, useState, useMemo } from "react";
import { ScreenHeader } from "@/components/ui/screen-header";
import { getTransactionsSince, getAccounts, getAssets } from "@/lib/supabase/database";
import { startOfMonthISO } from "@/lib/dates";
import { useCurrency } from "@/lib/currency";
import { BarPairChart } from "@/components/ui/bar-pair-chart";
import type { Txn, Account, Asset } from "@/lib/types";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, Landmark, Scale, ChevronRight } from "lucide-react";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { motion, AnimatePresence } from "framer-motion";
import { GaugeArc } from "@/components/ui/gauge-arc";

export function AnalyticsScreen({ onBack }: { onBack: () => void }) {
  const [txns, setTxns] = useState<Txn[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { fmt } = useCurrency();

  const load = async () => {
    const [t, a, s] = await Promise.all([
      getTransactionsSince(startOfMonthISO()),
      getAccounts(),
      getAssets()
    ]);
    setTxns(t || []);
    setAccounts(a || []);
    setAssets(s || []);
  };

  useEffect(() => { load(); }, []);

  // --- FINANCIAL CALCULATIONS ---
  const totalIncome = txns.filter(t => t.direction === "credit").reduce((s, t) => s + t.amount_minor, 0) / 100;
  const totalExpense = txns.filter(t => t.direction === "debit").reduce((s, t) => s + t.amount_minor, 0) / 100;
  
  const liquid = accounts.reduce((s, a) => s + (a.current_minor ?? a.balance_minor), 0) / 100;
  const nonLiquid = assets.filter(a => a.type === "asset").reduce((s, a) => s + a.value_minor, 0) / 100;
  const liabilities = assets.filter(a => a.type === "liability").reduce((s, a) => s + a.value_minor, 0) / 100;
  const netWorth = liquid + nonLiquid - liabilities;

  // Group by Category
  const byCat = new Map<string, number>();
  txns.filter(t => t.direction === "debit").forEach(t => {
    const k = t.category_name || "Uncategorized";
    byCat.set(k, (byCat.get(k) ?? 0) + t.amount_minor / 100);
  });
  const sortedCats = [...byCat.entries()].sort((a, b) => b[1] - a[1]);

  // Heatmap data (last 30 days)
  const heatmap = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const spent = txns.filter(t => t.direction === "debit" && t.date.startsWith(dateStr)).reduce((s, t) => s + t.amount_minor, 0) / 100;
      days.push({ date: d, spent });
    }
    const max = Math.max(...days.map(d => d.spent), 1);
    return { days, max };
  }, [txns]);

  // If a category is selected, show the Deep Dive
  if (selectedCategory) {
    const catTxns = txns.filter(t => (t.category_name || "Uncategorized") === selectedCategory && t.direction === "debit");
    const total = catTxns.reduce((s, t) => s + t.amount_minor, 0) / 100;
    const average = catTxns.length > 0 ? total / catTxns.length : 0;
    
    // Fake a budget limit for visual (in reality, fetch from budgets table)
    const budgetLimit = total * 1.3; 
    const pct = Math.min((total / budgetLimit) * 100, 100);

    // Group by sub-category (using description_clean for demo)
    const subCats = new Map<string, { amount: number, count: number }>();
    catTxns.forEach(t => {
      const k = t.description_clean || "Other";
      const prev = subCats.get(k) || { amount: 0, count: 0 };
      subCats.set(k, { amount: prev.amount + t.amount_minor / 100, count: prev.count + 1 });
    });
    const sortedSub = [...subCats.entries()].sort((a, b) => b[1].amount - a[1].amount).slice(0, 5);

    return (
      <div className="min-h-[100dvh] pb-32">
        <ScreenHeader 
          title={selectedCategory} 
          onBack={() => setSelectedCategory(null)} 
        />
        <div className="space-y-4 px-4 pt-6">
          {/* Gauge Card */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <GaugeArc percentage={pct} />
              <div className="text-right">
                <p className="text-[28px] font-bold tabular text-[var(--text-1)]">{fmt(total)}</p>
                <p className="text-[13px] text-[var(--text-3)]">of {fmt(budgetLimit)}</p>
                <span className="inline-block mt-1 rounded-md bg-[#DE3121]/10 px-2 py-0.5 text-[11px] font-bold text-[#DE3121]">
                  {pct > 90 ? "Too fast" : "On track"}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-[var(--line)] pt-4 mt-2">
              <div>
                <p className="text-[12px] text-[var(--text-3)]">Average</p>
                <p className="text-[15px] font-semibold text-[var(--text-1)]">{fmt(average)}</p>
              </div>
              <div className="text-right">
                <p className="text-[12px] text-[var(--text-3)]">Transactions</p>
                <p className="text-[15px] font-semibold text-[var(--text-1)]">{catTxns.length}</p>
              </div>
            </div>
          </div>

          {/* Subcategory Breakdown */}
          <div className="card p-6">
            <p className="mb-4 text-[15px] font-semibold text-[var(--text-1)]">Subcategory Breakdown</p>
            <div className="space-y-4">
              {sortedSub.map(([name, data]) => (
                <div key={name}>
                  <div className="flex justify-between text-[14px] mb-1">
                    <span className="text-[var(--text-1)]">{name}</span>
                    <span className="font-semibold tabular text-[var(--text-1)]">{fmt(data.amount)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--fill-2)]">
                      <div className="h-full rounded-full bg-[#DE3121]" style={{ width: `${(data.amount / total) * 100}%` }} />
                    </div>
                    <span className="text-[11px] text-[var(--text-3)] w-8 text-right">{Math.round((data.amount / total) * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN ANALYTICS HUB ---
  return (
    <PullToRefresh onRefresh={load}>
      <div className="min-h-[100dvh] pb-32">
        <ScreenHeader title="Analytics" onBack={onBack} />
        
        <div className="space-y-5 px-4 pt-6">
          
          {/* Top Tabs (Spending / Net Worth) - Placeholder for visual */}
          <div className="flex rounded-full bg-[var(--surface-2)] p-1">
            <button className="flex-1 rounded-full bg-[var(--surface-3)] py-2 text-[13px] font-semibold text-[var(--text-1)]">Spending</button>
            <button className="flex-1 rounded-full py-2 text-[13px] font-medium text-[var(--text-3)]">Net Worth</button>
          </div>

          {/* Total Expenses Card */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[14px] text-[var(--text-2)]">Total expenses</p>
              <span className="text-[14px] font-semibold text-[var(--text-1)]">{fmt(totalExpense)}</span>
            </div>
            
            {/* Heatmap */}
            <div className="grid grid-cols-10 gap-1.5 mb-4">
              {heatmap.days.map((d, i) => {
                const intensity = d.spent / heatmap.max;
                return (
                  <div 
                    key={i} 
                    className="aspect-square rounded-[3px]"
                    style={{ 
                      backgroundColor: d.spent === 0 ? "var(--fill-2)" : `rgba(222, 49, 33, ${Math.max(intensity, 0.2)})` 
                    }}
                  />
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-[var(--line)] pt-4">
              <div>
                <p className="text-[11px] text-[var(--text-3)]">Today</p>
                <p className="text-[14px] font-semibold text-[var(--text-1)]">{fmt(heatmap.days[29]?.spent || 0)}</p>
              </div>
              <div>
                <p className="text-[11px] text-[var(--text-3)]">Average</p>
                <p className="text-[14px] font-semibold text-[var(--text-1)]">{fmt(totalExpense / 30)}</p>
              </div>
              <div>
                <p className="text-[11px] text-[var(--text-3)]">Vs Last Month</p>
                <p className="text-[14px] font-semibold text-[var(--gain)] flex items-center gap-1">
                  <TrendingDown size={14} /> 12%
                </p>
              </div>
            </div>
          </div>

          {/* Net Worth Breakdown */}
          <div className="card p-5">
            <p className="text-[14px] text-[var(--text-2)] mb-1">Net Worth</p>
            <p className="text-[28px] font-bold tabular text-[var(--text-1)] mb-4">{fmt(netWorth)}</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--gain)]/10 text-[var(--gain)]"><Wallet size={14} /></div>
                  <span className="text-[14px] text-[var(--text-1)]">Liquid Assets</span>
                </div>
                <span className="text-[14px] font-semibold text-[var(--text-1)]">{fmt(liquid)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#DE3121]/10 text-[#DE3121]"><Landmark size={14} /></div>
                  <span className="text-[14px] text-[var(--text-1)]">Non-Liquid Assets</span>
                </div>
                <span className="text-[14px] font-semibold text-[var(--text-1)]">{fmt(nonLiquid)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--danger)]/10 text-[var(--danger)]"><Scale size={14} /></div>
                  <span className="text-[14px] text-[var(--text-1)]">Liabilities</span>
                </div>
                <span className="text-[14px] font-semibold text-[var(--danger)]">-{fmt(liabilities)}</span>
              </div>
            </div>
          </div>

          {/* Spending by Category */}
          <div>
            <p className="mb-3 px-1 text-[15px] font-semibold text-[var(--text-1)]">Spending by Category</p>
            <div className="group-list">
              {sortedCats.slice(0, 8).map(([name, amt]) => {
                const pct = (amt / totalExpense) * 100;
                return (
                  <button 
                    key={name} 
                    onClick={() => setSelectedCategory(name)}
                    className="flex w-full items-center justify-between px-4 py-3.5 hover:bg-[var(--fill-1)] transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-2 w-2 rounded-full bg-[#DE3121]" />
                      <span className="text-[14px] font-medium text-[var(--text-1)]">{name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] font-semibold tabular text-[var(--text-1)]">{fmt(amt)}</span>
                      <ChevronRight size={16} className="text-[var(--text-3)]" />
                    </div>
                  </button>
                );
              })}
              {sortedCats.length === 0 && (
                <EmptyState icon={TrendingUp} title="No spending yet" body="Import a statement to see analytics." />
              )}
            </div>
          </div>

        </div>
      </div>
    </PullToRefresh>
  );
}