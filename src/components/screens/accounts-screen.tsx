"use client";

import { useEffect, useState, useMemo } from "react";
import { ScreenHeader } from "@/components/ui/screen-header";
import { getTransactionsSince, getAccounts, getAssets } from "@/lib/supabase/database";
import { startOfMonthISO } from "@/lib/dates";
import { useCurrency } from "@/lib/currency";
import { BarPairChart } from "@/components/ui/bar-pair-chart";
import type { Txn, Account, Asset } from "@/lib/types";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, Landmark, Scale, ChevronRight, Sparkles, Lightbulb, DollarSign } from "lucide-react";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { motion, AnimatePresence } from "framer-motion";
import { GaugeArc } from "@/components/ui/gauge-arc";

export function AnalyticsScreen({ onBack }: { onBack: () => void }) {
  const [txns, setTxns] = useState<Txn[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"spending" | "networth">("spending");
  const { fmt } = useCurrency();

  // Simulated Exchange Rate (In a real app, fetch this from the DB or API)
  const exchangeRate = 1500;

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

  // Fake Data for Net Worth Trend Chart
  const netWorthHistory = [
    { month: "May", value: netWorth * 0.8 },
    { month: "Jun", value: netWorth * 0.85 },
    { month: "Jul", value: netWorth * 0.9 },
    { month: "Aug", value: netWorth * 0.95 },
    { month: "Sep", value: netWorth * 0.98 },
    { month: "Oct", value: netWorth },
  ];

  // If a category is selected, show the Deep Dive
  if (selectedCategory) {
    const catTxns = txns.filter(t => (t.category_name || "Uncategorized") === selectedCategory && t.direction === "debit");
    const total = catTxns.reduce((s, t) => s + t.amount_minor, 0) / 100;
    
    // Fake budget limit for visual (in reality, fetch from budgets table)
    const budgetLimit = total * 1.3; 
    const pct = Math.min((total / budgetLimit) * 100, 100);

    // Sub-category breakdown
    const subCats = new Map<string, { amount: number, count: number }>();
    catTxns.forEach(t => {
      const k = t.description_clean || "Other";
      const prev = subCats.get(k) || { amount: 0, count: 0 };
      subCats.set(k, { amount: prev.amount + t.amount_minor / 100, count: prev.count + 1 });
    });
    const sortedSub = [...subCats.entries()].sort((a, b) => b[1].amount - a[1].amount).slice(0, 5);

    // Fake Bar Chart Data (Last 6 Months)
    const barData = [
      { label: "May", value: total * 0.7 },
      { label: "Jun", value: total * 0.8 },
      { label: "Jul", value: total * 0.9 },
      { label: "Aug", value: total * 0.6 },
      { label: "Sep", value: total * 1.1 },
      { label: "Oct", value: total },
    ];
    const maxBar = Math.max(...barData.map(d => d.value));

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
            
            {/* NEW: Bar Chart (Last 6 Months) */}
            <div className="mt-6 border-t border-[var(--line)] pt-4">
              <div className="flex items-end justify-between h-24 gap-2">
                {barData.map((d) => (
                  <div key={d.label} className="flex flex-col items-center flex-1 gap-2">
                    <div 
                      className="w-full rounded-t-sm bg-[#DE3121]/40 hover:bg-[#DE3121] transition-colors" 
                      style={{ height: `${(d.value / maxBar) * 100}%`, minHeight: '4px' }} 
                    />
                    <span className="text-[10px] text-[var(--text-3)]">{d.label}</span>
                  </div>
                ))}
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
          
          {/* Top Tabs */}
          <div className="flex rounded-full bg-[var(--surface-2)] p-1">
            <button 
              onClick={() => setActiveTab("spending")}
              className={cn(
                "flex-1 rounded-full py-2 text-[13px] font-semibold transition-colors",
                activeTab === "spending" ? "bg-[var(--surface-3)] text-[var(--text-1)]" : "text-[var(--text-3)]"
              )}
            >Spending</button>
            <button 
              onClick={() => setActiveTab("networth")}
              className={cn(
                "flex-1 rounded-full py-2 text-[13px] font-semibold transition-colors",
                activeTab === "networth" ? "bg-[var(--surface-3)] text-[var(--text-1)]" : "text-[var(--text-3)]"
              )}
            >Net Worth</button>
          </div>

          {activeTab === "spending" ? (
            <>
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

              {/* Spending by Category */}
              <div>
                <p className="mb-3 px-1 text-[15px] font-semibold text-[var(--text-1)]">Spending by Category</p>
                <div className="group-list">
                  {sortedCats.slice(0, 8).map(([name, amt]) => {
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
                </div>
              </div>
            </>
          ) : (
            <>
              {/* NET WORTH DEEP DIVE */}
              <div className="card p-6 bg-gradient-to-br from-[var(--surface-2)] to-[#1c1c1e]">
                <p className="text-[14px] text-[var(--text-2)] mb-1">Net Worth</p>
                <p className="text-[32px] font-bold tabular text-[var(--text-1)] mb-2">{fmt(netWorth)}</p>
                
                {/* USD Conversion */}
                <div className="flex items-center gap-2 mb-4 rounded-xl bg-[var(--fill-1)] p-3">
                  <DollarSign size={16} className="text-[var(--gain)]" />
                  <p className="text-[13px] text-[var(--text-1)]">
                    ≈ <span className="font-bold">${(netWorth / exchangeRate).toLocaleString("en-US", { maximumFractionDigits: 0 })}</span> USD
                  </p>
                  <span className="ml-auto text-[11px] text-[var(--text-3)]">@ ₦{exchangeRate}/$</span>
                </div>

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

                {/* Net Worth Trend Chart */}
                <div className="mt-6 border-t border-[var(--line)] pt-4">
                  <p className="text-[12px] text-[var(--text-3)] mb-3">Net Worth Trend</p>
                  <div className="flex items-end justify-between h-20 gap-1">
                    {netWorthHistory.map((d) => (
                      <div key={d.month} className="flex flex-col items-center flex-1 gap-2">
                        <div 
                          className="w-full rounded-t-sm bg-gradient-to-t from-[#DE3121]/10 to-[#DE3121]" 
                          style={{ height: `${(d.value / netWorth) * 100}%`, minHeight: '4px' }} 
                        />
                        <span className="text-[10px] text-[var(--text-3)]">{d.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Advisory Drop for Net Worth */}
              <div className="relative overflow-hidden rounded-2xl border border-[#DE3121]/20 bg-[#DE3121]/5 p-5">
                <div className="absolute -right-4 -top-4 text-[#DE3121]/10">
                  <Sparkles size={100} />
                </div>
                <div className="relative z-10 flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DE3121] text-white">
                    <Lightbulb size={16} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#DE3121]">AI Advisor Insight</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-2)]">
                      {nonLiquid > liquid * 2 
                        ? "Most of your wealth is tied up in illiquid assets (like land). While great for long-term growth, consider building a larger cash buffer for emergencies."
                        : "You have a healthy balance of liquid and illiquid assets. Consider putting your idle cash into a high-yield Money Market Fund to beat inflation."
                      }
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </PullToRefresh>
  );
}