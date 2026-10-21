"use client";

import { useEffect, useState, useMemo } from "react";
import { ScreenHeader } from "@/components/ui/screen-header";
import { getTransactionsSince, getAccounts, getAssets, getBudgets } from "@/lib/supabase/database";
import { startOfMonthISO } from "@/lib/dates";
import { useCurrency } from "@/lib/currency";
import type { Txn, Account, Asset, Budget } from "@/lib/types";
import { TrendingDown, Wallet, Landmark, Scale, ChevronRight, Sparkles, Lightbulb, DollarSign } from "lucide-react";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { GaugeArc } from "@/components/ui/gauge-arc";
import { cn } from "@/lib/utils";

export function AnalyticsScreen({ onBack }: { onBack: () => void }) {
  const [txns, setTxns] = useState<Txn[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"spending" | "networth">("spending");
  
  // Account Filter
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all");
  
  const { fmt } = useCurrency();
  const exchangeRate = 1500;

  const load = async () => {
    const [t, a, s, b] = await Promise.all([
      getTransactionsSince(startOfMonthISO()),
      getAccounts(),
      getAssets(),
      getBudgets(null) // Load budgets for the workspace
    ]);
    setTxns(t || []);
    setAccounts(a || []);
    setAssets(s || []);
    setBudgets(b || []);
  };

  useEffect(() => { load(); }, []);

  // --- FILTER DATA BY ACCOUNT ---
  const filteredTxns = useMemo(() => {
    if (selectedAccountId === "all") return txns;
    return txns.filter(t => t.account_id === selectedAccountId);
  }, [txns, selectedAccountId]);

  const totalExpense = filteredTxns.filter(t => t.direction === "debit").reduce((s, t) => s + t.amount_minor, 0) / 100;
  
  const liquid = accounts.reduce((s, a) => s + (a.current_minor ?? a.balance_minor), 0) / 100;
  const nonLiquid = assets.filter(a => a.type === "asset").reduce((s, a) => s + a.value_minor, 0) / 100;
  const liabilities = assets.filter(a => a.type === "liability").reduce((s, a) => s + a.value_minor, 0) / 100;
  const netWorth = liquid + nonLiquid - liabilities;

  // Group by Category
  const byCat = new Map<string, number>();
  filteredTxns.filter(t => t.direction === "debit").forEach(t => {
    const k = t.category_name || "Uncategorized";
    byCat.set(k, (byCat.get(k) ?? 0) + t.amount_minor / 100);
  });
  const sortedCats = [...byCat.entries()].sort((a, b) => b[1] - a[1]);

  // Heatmap data (last 30 days) - Now Strictly Black/Grey
  const heatmap = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const spent = filteredTxns.filter(t => t.direction === "debit" && t.date.startsWith(dateStr)).reduce((s, t) => s + t.amount_minor, 0) / 100;
      days.push({ date: d, spent, dateStr });
    }
    const max = Math.max(...days.map(d => d.spent), 1);
    return { days, max };
  }, [filteredTxns]);

  // --- CATEGORY DEEP DIVE ---
  if (selectedCategory) {
    const catTxns = filteredTxns.filter(t => (t.category_name || "Uncategorized") === selectedCategory && t.direction === "debit");
    const total = catTxns.reduce((s, t) => s + t.amount_minor, 0) / 100;
    
    // Get Real Budget
    const catBudget = budgets.find(b => b.category === selectedCategory)?.limit_minor ?? 0;
    const budgetLimit = catBudget / 100;
    const pct = budgetLimit > 0 ? Math.min((total / budgetLimit) * 100, 100) : 0;

    // Real Sub-category breakdown
    const subCats = new Map<string, { amount: number, count: number }>();
    catTxns.forEach(t => {
      const k = t.description_clean || "Other";
      const prev = subCats.get(k) || { amount: 0, count: 0 };
      subCats.set(k, { amount: prev.amount + t.amount_minor / 100, count: prev.count + 1 });
    });
    const sortedSub = [...subCats.entries()].sort((a, b) => b[1].amount - a[1].amount).slice(0, 5);

    // Real Bar Chart Data (Last 6 Months)
    const barData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthLabel = d.toLocaleDateString("en-NG", { month: "short" });
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString();
      
      const spent = txns.filter(t => 
        (t.category_name || "Uncategorized") === selectedCategory && 
        t.direction === "debit" &&
        t.date >= monthStart && 
        t.date <= monthEnd
      ).reduce((s, t) => s + t.amount_minor, 0) / 100;

      barData.push({ label: monthLabel, value: spent });
    }
    const maxBar = Math.max(...barData.map(d => d.value), 1);

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
                <p className="text-[13px] text-[var(--text-3)]">of {budgetLimit > 0 ? fmt(budgetLimit) : "no limit"}</p>
                {budgetLimit > 0 && (
                  <span className="inline-block mt-1 rounded-md bg-[#DE3121]/10 px-2 py-0.5 text-[11px] font-bold text-[#DE3121]">
                    {pct > 90 ? "Too fast" : "On track"}
                  </span>
                )}
              </div>
            </div>
            
            {/* Real Bar Chart (Last 6 Months) */}
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

          {/* AI Insight */}
          <div className="relative overflow-hidden rounded-2xl border border-[#DE3121]/20 bg-[#DE3121]/5 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DE3121] text-white">
                <Lightbulb size={16} />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#DE3121]">Insight</p>
                <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-2)]">
                  {pct > 90 
                    ? `You've used ${Math.round(pct)}% of your ${selectedCategory} budget. Consider slowing down to avoid going over.`
                    : `You're on track with your ${selectedCategory} budget. Most of your spending here is on ${sortedSub[0]?.[0] || "recent items"}.`
                  }
                </p>
              </div>
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
              {/* Account Selector */}
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => setSelectedAccountId("all")}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap shrink-0",
                    selectedAccountId === "all" ? "bg-[var(--brand)] text-white" : "bg-[var(--surface-2)] text-[var(--text-3)]"
                  )}
                >
                  All Accounts
                </button>
                {accounts.map(a => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedAccountId(a.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap shrink-0",
                      selectedAccountId === a.id ? "bg-[var(--brand)] text-white" : "bg-[var(--surface-2)] text-[var(--text-3)]"
                    )}
                  >
                    {a.name}
                  </button>
                ))}
              </div>

              {/* Total Expenses Card */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[14px] text-[var(--text-2)]">Total expenses</p>
                  <span className="text-[14px] font-semibold text-[var(--text-1)]">{fmt(totalExpense)}</span>
                </div>
                
                {/* Heatmap - Fixed to Black/Grey */}
                <div className="grid grid-cols-10 gap-1.5 mb-4">
                  {heatmap.days.map((d, i) => {
                    const intensity = d.spent / heatmap.max;
                    return (
                      <div 
                        key={i} 
                        title={`${d.date.toLocaleDateString("en-NG", { month: "short", day: "numeric" })}: ${fmt(d.spent)}`}
                        className="aspect-square rounded-[3px] cursor-pointer hover:ring-1 hover:ring-white/50"
                        style={{ 
                          backgroundColor: d.spent === 0 
                            ? "rgba(0,0,0,0.2)" // Empty day
                            : `rgba(0,0,0, ${0.4 + (intensity * 0.6)})` // Black intensity
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
                  {sortedCats.length === 0 && (
                    <p className="px-4 py-6 text-center text-[14px] text-[var(--text-3)]">No spending in this period.</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* NET WORTH DEEP DIVE */}
              <div className="card p-6 bg-gradient-to-br from-[var(--surface-2)] to-[#1c1c1e]">
                <p className="text-[14px] text-[var(--text-2)] mb-1">Net Worth</p>
                <p className="text-[32px] font-bold tabular text-[var(--text-1)] mb-2">{fmt(netWorth)}</p>
                
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
              </div>

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