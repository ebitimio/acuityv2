"use client";

import { useEffect, useState, useMemo } from "react";
import { ScreenHeader } from "@/components/ui/screen-header";
import { getTransactionsBetween, getAccounts, getAssets } from "@/lib/supabase/database";
import { useCurrency } from "@/lib/currency";
import { useToast } from "@/components/ui/toast";
import { useWorkspace } from "@/lib/workspace";
import type { Txn, Account, Asset, Budget } from "@/lib/types";
import { TrendingDown, TrendingUp, Wallet, Landmark, Scale, ChevronRight, ChevronLeft, Lightbulb, DollarSign, Info } from "lucide-react";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { GaugeArc } from "@/components/ui/gauge-arc";
import { cn } from "@/lib/utils";
import { formatLocalDate } from "@/lib/dates";

export function AnalyticsScreen({ onBack, onNavigateTransactions }: { onBack: () => void; onNavigateTransactions: () => void }) {
  const [txns, setTxns] = useState<Txn[]>([]);
  const [prevMonthSpent, setPrevMonthSpent] = useState<number>(0);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"spending" | "networth">("spending");
  const [monthOffset, setMonthOffset] = useState<number>(0); // 0 = current, -1 = last month...
  
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all");
  
  const { fmt, rate } = useCurrency();
  const toast = useToast();
  const { active: activeWs } = useWorkspace();
  const exchangeRate = rate > 0 ? rate : 1500;

  const targetDate = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  const displayMonthName = targetDate.toLocaleDateString("en-NG", { month: "long", year: "numeric" });

  const load = async () => {
    if (!activeWs?.id) return;

    const y = targetDate.getFullYear();
    const m = targetDate.getMonth();
    const startOfMonth = new Date(y, m, 1, 0, 0, 0, 0).toISOString();
    const endOfMonth = new Date(y, m + 1, 0, 23, 59, 59, 999).toISOString();

    const prevY = m === 0 ? y - 1 : y;
    const prevM = m === 0 ? 11 : m - 1;
    const prevStart = new Date(prevY, prevM, 1, 0, 0, 0, 0).toISOString();
    const prevEnd = new Date(prevY, prevM + 1, 0, 23, 59, 59, 999).toISOString();

    const { data: allBudgets } = await (await import("@/lib/supabase/client")).createClient()
      .from("budgets")
      .select("*")
      .eq("workspace_id", activeWs.id)
      .order("created_at", { ascending: false });

    const [t, prevT, a, s] = await Promise.all([
      getTransactionsBetween(startOfMonth, endOfMonth),
      getTransactionsBetween(prevStart, prevEnd),
      getAccounts(),
      getAssets(),
    ]);
    setTxns(t || []);
    const prevDebits = (prevT || [])
      .filter((tx) => tx.direction === "debit" && tx.category_name !== "Transfers" && tx.category_name !== "Adjustment")
      .reduce((sum, tx) => sum + tx.amount_minor, 0) / 100;
    setPrevMonthSpent(prevDebits);
    setAccounts(a || []);
    setAssets(s || []);
    setBudgets((allBudgets as Budget[]) || []);
  };

  useEffect(() => { 
    setTxns([]);
    setAccounts([]);
    setAssets([]);
    setBudgets([]);
    setSelectedCategory(null);
    setSelectedAccountId("all");
    load(); 
  }, [activeWs?.id, monthOffset]);

  const filteredTxns = useMemo(() => {
    let base = txns;
    if (selectedAccountId !== "all") {
      base = base.filter(t => t.account_id === selectedAccountId);
    }
    // CHANGED: Exclude "Transfers" and "Adjustment" from spending calculations
    return base.filter(t => t.category_name !== "Transfers" && t.category_name !== "Adjustment");
  }, [txns, selectedAccountId]);

  const totalExpense = filteredTxns.filter(t => t.direction === "debit").reduce((s, t) => s + t.amount_minor, 0) / 100;
  
  const liquid = accounts.reduce((s, a) => s + (a.current_minor ?? a.balance_minor), 0) / 100;
  const nonLiquid = assets.filter(a => a.type === "asset").reduce((s, a) => s + a.value_minor, 0) / 100;
  const liabilities = assets.filter(a => a.type === "liability").reduce((s, a) => s + a.value_minor, 0) / 100;
  const netWorth = liquid + nonLiquid - liabilities;

  const byCat = new Map<string, number>();
  filteredTxns.filter(t => t.direction === "debit").forEach(t => {
    const k = t.category_name || "Uncategorized";
    byCat.set(k, (byCat.get(k) ?? 0) + t.amount_minor / 100);
  });
  const sortedCats = [...byCat.entries()].sort((a, b) => b[1] - a[1]);

  // Heatmap for the selected target month
  const heatmap = useMemo(() => {
    const days = [];
    const yyyy = targetDate.getFullYear();
    const mm = String(targetDate.getMonth() + 1).padStart(2, "0");
    const daysCount = new Date(yyyy, targetDate.getMonth() + 1, 0).getDate();

    for (let day = 1; day <= daysCount; day++) {
      const d = new Date(yyyy, targetDate.getMonth(), day);
      const dd = String(day).padStart(2, "0");
      const localDateStr = `${yyyy}-${mm}-${dd}`;

      const spent = filteredTxns
        .filter(t => t.direction === "debit")
        .filter(t => {
          const txnDate = new Date(t.date);
          const txnY = txnDate.getFullYear();
          const txnM = String(txnDate.getMonth() + 1).padStart(2, "0");
          const txnD = String(txnDate.getDate()).padStart(2, "0");
          return `${txnY}-${txnM}-${txnD}` === localDateStr;
        })
        .reduce((s, t) => s + t.amount_minor, 0) / 100;

      days.push({ date: d, spent, localDateStr, day });
    }
    const max = Math.max(...days.map(d => d.spent), 1);
    return { days, max };
  }, [filteredTxns, targetDate]);

  const handleSquareTap = (day: { date: Date; spent: number }) => {
    const label = day.date.toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" });
    toast(`${label}: ${fmt(day.spent)} spent`);
  };

  const diff = totalExpense - prevMonthSpent;
  const pctChange = prevMonthSpent > 0 ? Math.round((Math.abs(diff) / prevMonthSpent) * 100) : 0;
  const isReduction = diff <= 0;

  if (selectedCategory) {
    const catTxns = filteredTxns.filter(t => (t.category_name || "Uncategorized") === selectedCategory && t.direction === "debit");
    const total = catTxns.reduce((s, t) => s + t.amount_minor, 0) / 100;
    
    const catBudgets = budgets.filter(b => b.category === selectedCategory);
    const totalCatBudget = catBudgets.reduce((sum, b) => sum + b.limit_minor, 0) / 100;
    
    const pct = totalCatBudget > 0 ? Math.min((total / totalCatBudget) * 100, 100) : 0;

    const selectedYear = targetDate.getFullYear();
    const selectedMonth = targetDate.getMonth();
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
    const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const daysWithSpending = new Set(
      catTxns
        .filter(t => {
          const d = new Date(t.date);
          return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
        })
        .map(t => new Date(t.date).getDate())
    );

    const isCurrentMonthView = selectedMonth === new Date().getMonth() && selectedYear === new Date().getFullYear();
    const todayDate = new Date().getDate();

    return (
      <div className="min-h-[100dvh] pb-32">
        <ScreenHeader 
          title={selectedCategory} 
          onBack={() => setSelectedCategory(null)} 
        />
        <div className="space-y-4 px-4 pt-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <GaugeArc percentage={pct} />
              <div className="text-right">
                <p className="text-[28px] font-bold tabular text-[var(--text-1)]">{fmt(total)}</p>
                <p className="text-[13px] text-[var(--text-3)]">
                  {totalCatBudget > 0 ? `of ${fmt(totalCatBudget)}` : "no limit"}
                </p>
                {totalCatBudget > 0 && (
                  <span className="inline-block mt-1 rounded-md bg-[var(--brand)]/10 px-2 py-0.5 text-[11px] font-bold text-[var(--brand)]">
                    {pct > 90 ? "Too fast" : "On track"}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 rounded-[24px] bg-[#1c1c1e] border border-white/5 shadow-xl">
            <p className="mb-4 text-[15px] font-semibold text-white">
              {displayMonthName}
            </p>
            
            <div className="grid grid-cols-7 gap-1 mb-2 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <div key={d} className="text-[10px] font-medium text-white/40">{d[0]}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              
              {calendarDays.map(day => {
                const hasSpend = daysWithSpending.has(day);
                const isToday = isCurrentMonthView && day === todayDate;
                return (
                  <div 
                    key={day}
                    className={cn(
                      "flex items-center justify-center aspect-square rounded-full text-[13px] font-medium transition-colors",
                      hasSpend ? "bg-[var(--brand)] text-[var(--brand-ink)] font-bold" : "bg-white/5 text-white/60",
                      isToday && "ring-2 ring-[var(--brand)] ring-offset-2 ring-offset-[#1c1c1e]"
                    )}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-[11px] text-white/40 flex items-center gap-1">
              <Info size={12} /> Days highlighted in brand color are days you spent money.
            </p>
          </div>

          <div className="card p-0">
            <div className="px-4 py-4 border-b border-[var(--line)] flex items-center justify-between">
              <p className="text-[15px] font-semibold text-[var(--text-1)]">Transactions</p>
              <button onClick={onNavigateTransactions} className="text-[12px] font-medium text-[var(--brand)]">
                See all
              </button>
            </div>
            <div className="divide-y divide-[var(--line)]">
              {catTxns.slice(0, 10).map(t => (
                <div key={t.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-[14px] font-medium text-[var(--text-1)]">
                      {t.description_clean || t.description_raw || t.category_name || "Transaction"}
                    </p>
                    <p className="text-[11px] text-[var(--text-3)]">
                      {new Date(t.date).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <span className="text-[14px] font-semibold tabular text-[var(--text-1)]">
                    {fmt(t.amount_minor / 100)}
                  </span>
                </div>
              ))}
              {catTxns.length === 0 && (
                <p className="px-4 py-6 text-center text-[14px] text-[var(--text-3)]">No transactions yet.</p>
              )}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-[var(--brand)]/20 bg-[var(--brand)]/5 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-[var(--brand-ink)]">
                <Lightbulb size={16} />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[var(--brand)]">Insight</p>
                <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-2)]">
                  {pct > 90 
                    ? `You've used ${Math.round(pct)}% of your ${selectedCategory} budget. Consider slowing down to avoid going over.`
                    : `You're on track with your ${selectedCategory} budget.`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={load}>
      <div className="min-h-[100dvh] pb-32">
        <ScreenHeader title="Analytics" onBack={onBack} />
        
        <div className="space-y-5 px-4 pt-6">
          
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
              {/* Month Navigator */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setMonthOffset((o) => o - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all"
                    aria-label="Previous month"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-[14.5px] font-bold text-white px-1">
                    {displayMonthName}
                  </span>
                  <button
                    type="button"
                    disabled={monthOffset >= 0}
                    onClick={() => setMonthOffset((o) => o + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
                    aria-label="Next month"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                {monthOffset !== 0 && (
                  <button
                    type="button"
                    onClick={() => setMonthOffset(0)}
                    className="text-[11.5px] font-bold text-[var(--brand)] px-2.5 py-1 rounded-full bg-[var(--brand-soft)] hover:bg-[var(--brand)] hover:text-[var(--brand-ink)] transition-all"
                  >
                    Current Month
                  </button>
                )}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => setSelectedAccountId("all")}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap shrink-0",
                    selectedAccountId === "all" ? "bg-[var(--brand)] text-[var(--brand-ink)]" : "bg-[var(--surface-2)] text-[var(--text-3)]"
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
                      selectedAccountId === a.id ? "bg-[var(--brand)] text-[var(--brand-ink)]" : "bg-[var(--surface-2)] text-[var(--text-3)]"
                    )}
                  >
                    {a.name}
                  </button>
                ))}
              </div>

              <div className="p-5 rounded-[24px] bg-[#1c1c1e] border border-white/5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[14px] text-white/60">Total expenses</p>
                  <span className="text-[14px] font-semibold text-white">{fmt(totalExpense)}</span>
                </div>
                
                <div className="grid grid-cols-10 gap-1.5 mb-2">
                  {heatmap.days.map((d, i) => {
                    const intensity = d.spent / heatmap.max;
                    return (
                      <button
                        key={i}
                        onClick={() => handleSquareTap(d)}
                        className="aspect-square rounded-[3px] cursor-pointer hover:ring-1 hover:ring-white/50 active:scale-95 transition-transform"
                        style={{ 
                          backgroundColor: d.spent === 0 
                            ? "rgba(255,255,255,0.05)" 
                            : `rgba(var(--brand-rgb, 222, 49, 33), ${Math.max(intensity, 0.3)})` 
                        }}
                        aria-label={`${d.date.toLocaleDateString()} - ${fmt(d.spent)}`}
                      />
                    );
                  })}
                </div>
                <p className="text-[11px] text-white/40 mb-4 flex items-center gap-1">
                  <Info size={12} /> Tap a square to see daily spend. Darker color = more spent.
                </p>

                <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
                  <div>
                    <p className="text-[11px] text-white/40">Today</p>
                    <p className="text-[14px] font-semibold text-white">
                      {fmt(heatmap.days.find(d => d.localDateStr === formatLocalDate())?.spent || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-white/40">Average</p>
                    <p className="text-[14px] font-semibold text-white">{fmt(totalExpense / Math.max(heatmap.days.length, 1))}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-white/40">Vs Last Month</p>
                    {prevMonthSpent > 0 ? (
                      <p className={cn("text-[14px] font-semibold flex items-center gap-1", isReduction ? "text-[var(--gain)]" : "text-[var(--danger)]")}>
                        {isReduction ? <TrendingDown size={14} /> : <TrendingUp size={14} />} {pctChange}%
                      </p>
                    ) : (
                      <p className="text-[14px] font-semibold text-white/60">—</p>
                    )}
                  </div>
                </div>
              </div>

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
                          <div className="h-2 w-2 rounded-full bg-[var(--brand)]" />
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
              <div className="p-6 rounded-[24px] bg-[#1c1c1e] border border-white/5 shadow-xl">
                <p className="text-[14px] text-white/60 mb-1">Net Worth</p>
                <p className="text-[32px] font-bold tabular text-white mb-2">{fmt(netWorth)}</p>
                
                <div className="flex items-center gap-2 mb-4 rounded-xl bg-white/5 p-3">
                  <DollarSign size={16} className="text-[var(--gain)]" />
                  <p className="text-[13px] text-white">
                    ≈ <span className="font-bold">${(netWorth / exchangeRate).toLocaleString("en-US", { maximumFractionDigits: 0 })}</span> USD
                  </p>
                  <span className="ml-auto text-[11px] text-white/40">@ ₦{exchangeRate}/$</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--gain)]/10 text-[var(--gain)]"><Wallet size={14} /></div>
                      <span className="text-[14px] text-white">Liquid Assets</span>
                    </div>
                    <span className="text-[14px] font-semibold text-white">{fmt(liquid)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand)]/10 text-[var(--brand)]"><Landmark size={14} /></div>
                      <span className="text-[14px] text-white">Non-Liquid Assets</span>
                    </div>
                    <span className="text-[14px] font-semibold text-white">{fmt(nonLiquid)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--danger)]/10 text-[var(--danger)]"><Scale size={14} /></div>
                      <span className="text-[14px] text-white">Liabilities</span>
                    </div>
                    <span className="text-[14px] font-semibold text-[var(--danger)]">-{fmt(liabilities)}</span>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-[var(--brand)]/20 bg-[var(--brand)]/5 p-5">
                <div className="absolute -right-4 -top-4 text-[var(--brand)]/10">
                  <span className="font-black text-[80px] tracking-tighter leading-none select-none pointer-events-none">A.</span>
                </div>
                <div className="relative z-10 flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-[var(--brand-ink)]">
                    <Lightbulb size={16} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[var(--brand)]">AI Advisor Insight</p>
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