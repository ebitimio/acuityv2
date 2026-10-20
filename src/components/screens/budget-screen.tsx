"use client";

import { useEffect, useState } from "react";
import { ScreenHeader, IconButton } from "@/components/ui/screen-header";
import { Plus, Trash2, CalendarRange, Settings2 } from "lucide-react";
import {
  getHomeMetrics, getTransactionsSince, getAccounts,
  getCurrentCycle, updateCycleStartDay,
  getCustomCategories, addCustomCategory, deleteCustomCategory,
  getBudgets, setBudget, deleteBudget,
} from "@/lib/supabase/database";
import { startOfMonthISO } from "@/lib/dates";
import { useCurrency } from "@/lib/currency";
import { GaugeArc } from "@/components/ui/gauge-arc";
import { Modal } from "@/components/ui/modal";
import { Field, Button } from "@/components/ui/form";
import { CurrencyField } from "@/components/ui/currency-field";
import { useToast } from "@/components/ui/toast";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import type { Txn, HomeMetrics, Account, CustomCategory, Budget } from "@/lib/types";
import { getCategory } from "@/lib/categories";
import { buildCategoryList } from "@/lib/category-options";

const ZERO_METRICS: HomeMetrics = {
  net_worth_minor: 0,
  total_spent_minor: 0,
  total_income_minor: 0,
  budget_limit_minor: 0,
  uncategorized_count: 0,
};

export function BudgetScreen({ onBack }: { onBack: () => void }) {
  const [metrics, setMetrics] = useState<HomeMetrics>(ZERO_METRICS);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [cycle, setCycle] = useState<{ cycle_start: string; cycle_end: string } | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [isCycleOpen, setIsCycleOpen] = useState(false);
  const [cycleDay, setCycleDay] = useState("1");
  const [isCatsOpen, setIsCatsOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [isBudgetEditorOpen, setIsBudgetEditorOpen] = useState(false);

  const [categoryLimits, setCategoryLimits] = useState<Record<string, number>>({});

  const { fmt } = useCurrency();
  const toast = useToast();

  const loadBudgetsForAccount = async (accountKey: string) => {
    if (!accountKey) { setBudgets([]); setCategoryLimits({}); return; }
    try {
      const bs = await getBudgets(accountKey);
      setBudgets(bs ?? []);
      const map: Record<string, number> = {};
      for (const b of bs ?? []) map[b.category] = b.limit_minor / 100;
      setCategoryLimits(map);
    } catch (e: any) {
      console.error("getBudgets failed:", e);
      setBudgets([]);
      setCategoryLimits({});
    }
  };

  const loadStatic = async () => {
    try { setMetrics((await getHomeMetrics()) ?? ZERO_METRICS); } catch {}
    try { setTxns((await getTransactionsSince(startOfMonthISO())) ?? []); } catch {}
    try {
      const accs = await getAccounts();
      setAccounts(accs ?? []);
      if (accs && accs.length > 0 && !selectedAccount) {
        setSelectedAccount(accs[0].id);
      }
    } catch {}
    try { setCategories((await getCustomCategories()) ?? []); } catch {}
    try { setCycle(await getCurrentCycle()); } catch { setCycle(null); }
  };

  useEffect(() => { loadStatic(); }, []);
  useEffect(() => { loadBudgetsForAccount(selectedAccount); }, [selectedAccount]);

  const saveCycle = async () => {
    try {
      await updateCycleStartDay(parseInt(cycleDay));
      toast("Payday cycle saved");
      setIsCycleOpen(false);
      loadStatic();
    } catch (e: any) { toast(e.message ?? "Could not save", "err"); }
  };

  const addCat = async () => {
    if (!newCatName.trim()) return;
    try {
      await addCustomCategory(newCatName.trim());
      setNewCatName("");
      await loadStatic();
      await loadBudgetsForAccount(selectedAccount);
    } catch (e: any) { toast(e.message ?? "Could not add", "err"); }
  };

  const removeCat = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Existing transactions keep their label.`)) return;
    await deleteCustomCategory(id);
    await loadStatic();
    await loadBudgetsForAccount(selectedAccount);
  };

  const setCategoryAmount = async (category: string, amount: number) => {
    setCategoryLimits((prev) => ({ ...prev, [category]: amount }));
    try {
      if (amount <= 0) {
        const existing = budgets.find((b) => b.category === category);
        if (existing) {
          await deleteBudget(existing.id);
          setBudgets((prev) => prev.filter((b) => b.id !== existing.id));
        }
      } else {
        await setBudget(selectedAccount, category, Math.round(amount * 100));
        await loadBudgetsForAccount(selectedAccount);
      }
    } catch (e: any) { toast(e.message ?? "Could not save category budget", "err"); }
  };

  const filteredTxns = selectedAccount
    ? txns.filter((t) => t.account_id === selectedAccount)
    : [];
  const spent = filteredTxns.filter((t) => t.direction === "debit").reduce((s, t) => s + t.amount_minor, 0) / 100;
  const totalBudget = Object.values(categoryLimits).reduce((s, v) => s + v, 0);
  const pct = totalBudget > 0 ? Math.min((spent / totalBudget) * 100, 100) : 0;

  const byCat = new Map<string, number>();
  for (const t of filteredTxns) {
    if (t.direction === "debit") {
      const k = t.category_name || "Uncategorized";
      byCat.set(k, (byCat.get(k) ?? 0) + t.amount_minor / 100);
    }
  }

  const allOptions = buildCategoryList(categories.map((c) => c.name));
  const allCategoryNames = Array.from(new Set([
    ...allOptions,
    ...Object.keys(categoryLimits),
    ...byCat.keys(),
  ])).filter((c) => c !== "Split Parent");

  const categoryRows = allCategoryNames
    .map((name) => ({
      name,
      spent: byCat.get(name) ?? 0,
      limit: categoryLimits[name] ?? 0,
    }))
    .filter((r) => r.spent > 0 || r.limit > 0 || categories.some((c) => c.name === r.name))
    .sort((a, b) => b.spent - a.spent || b.limit - a.limit);

  const cycleLabel = cycle
    ? `${new Date(cycle.cycle_start).toLocaleDateString("en-NG", { day: "numeric", month: "short" })} — ${new Date(cycle.cycle_end).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}`
    : "";

  const selectedAccountName = accounts.find((a) => a.id === selectedAccount)?.name ?? "";

  return (
    <PullToRefresh onRefresh={loadStatic}>
      <div className="min-h-[100dvh] pb-32">
        <ScreenHeader
          title="Budget"
          onBack={onBack}
          right={
            <div className="flex gap-2">
              <IconButton label="Cycle" onClick={() => setIsCycleOpen(true)}><CalendarRange size={16} /></IconButton>
              <IconButton label="Manage categories" onClick={() => setIsCatsOpen(true)}><Settings2 size={16} /></IconButton>
            </div>
          }
        />

        <div className="px-4 pt-6 space-y-5">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {accounts.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAccount(a.id)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap shrink-0 ${
                  selectedAccount === a.id ? "bg-[var(--brand)] text-[var(--text-1)]" : "bg-[var(--fill-2)] text-[var(--text-2)]"
                }`}
              >
                {a.name}
              </button>
            ))}
            {accounts.length === 0 && (
              <p className="text-[13px] text-[var(--text-3)]">
                No accounts yet. Add one from the Accounts screen.
              </p>
            )}
          </div>

          {cycleLabel && (
            <p className="text-[12px] text-[var(--text-3)] px-1">Current cycle: {cycleLabel}</p>
          )}

          <div className="rounded-3xl bg-[var(--surface-2)] border border-[var(--line)] p-6 flex flex-col items-center">
            <GaugeArc percentage={pct} />
            <p className="text-[13px] text-[var(--text-2)] mt-4">Left to spend</p>
            <p className="text-[28px] font-bold tabular">{fmt(Math.max(totalBudget - spent, 0))}</p>
            <div className="w-full flex justify-between mt-4 pt-4 border-t border-[var(--line)] text-[13px]">
              <div>
                <p className="text-[var(--text-3)]">Total budget</p>
                <p className="font-semibold">{fmt(totalBudget)}</p>
              </div>
              <div className="text-right">
                <p className="text-[var(--text-3)]">Spent</p>
                <p className="font-semibold">{fmt(spent)}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-[15px] font-semibold">Category budgets</h3>
              <button onClick={() => setIsBudgetEditorOpen(true)} className="text-[13px] text-[var(--brand)] font-semibold flex items-center gap-1">
                <Plus size={14} /> Edit amounts
              </button>
            </div>
            <div className="group-list">
              {categoryRows.map((row) => {
                const cat = getCategory(row.name);
                const Icon = cat.icon;
                return (
                  <div key={row.name} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${cat.color}22`, color: cat.color }}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium truncate">{row.name}</p>
                      <p className="text-[11px] text-[var(--text-3)] tabular">
                        {fmt(row.spent)} {row.limit > 0 ? `of ${fmt(row.limit)}` : "· no limit set"}
                      </p>
                    </div>
                    <p className="tabular font-semibold text-[14px]">
                      {row.limit > 0 && row.spent > row.limit ? (
                        <span className="text-[var(--danger)]">over</span>
                      ) : row.limit > 0 ? (
                        <span className="text-[var(--gain)]">{fmt(row.limit - row.spent)} left</span>
                      ) : (
                        <span className="text-[var(--text-3)]">—</span>
                      )}
                    </p>
                  </div>
                );
              })}
              {categoryRows.length === 0 && (
                <p className="px-4 py-6 text-center text-[14px] text-[var(--text-3)]">
                  {selectedAccount ? "No categories yet. Add amounts to start your budget." : "Add an account to start budgeting."}
                </p>
              )}
            </div>
          </div>
        </div>

        <Modal open={isCycleOpen} onClose={() => setIsCycleOpen(false)} title="Payday cycle">
          <div className="space-y-3">
            <p className="text-[13px] text-[var(--text-2)]">Which day do you get paid? This becomes the start of your budget cycle.</p>
            <Field label="Day of month (1-28)" type="number" value={cycleDay} onChange={(e) => setCycleDay(e.target.value)} />
            <Button onClick={saveCycle}>Save</Button>
          </div>
        </Modal>

        <Modal open={isCatsOpen} onClose={() => setIsCatsOpen(false)} title="Custom categories">
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Church, Black tax"
                className="flex-1 h-11 px-3 rounded-xl bg-[var(--surface-1)] border border-[var(--line-strong)] text-[14px]"
                style={{ fontSize: 16 }}
              />
              <Button onClick={addCat} className="!w-auto px-4 !h-11">Add</Button>
            </div>
            <div className="space-y-1">
              {categories.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--surface-1)]">
                  <span className="text-[14px]">{c.name}</span>
                  <button onClick={() => removeCat(c.id, c.name)} className="text-[var(--danger)]"><Trash2 size={14} /></button>
                </div>
              ))}
              {categories.length === 0 && <p className="text-[13px] text-[var(--text-3)] text-center py-4">No custom categories yet.</p>}
            </div>
          </div>
        </Modal>

        <Modal open={isBudgetEditorOpen} onClose={() => setIsBudgetEditorOpen(false)} title="Set category budgets">
          <div className="space-y-3">
            <p className="text-[12px] text-[var(--text-3)] px-1">
              Enter the amount you plan to spend on each category this cycle for <strong>{selectedAccountName || "this account"}</strong>.
            </p>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {allCategoryNames.map((name) => (
                <CurrencyField
                  key={name}
                  label={name}
                  value={categoryLimits[name] ?? 0}
                  onChange={(v) => setCategoryAmount(name, v)}
                />
              ))}
            </div>
            <Button variant="ghost" onClick={() => { setIsBudgetEditorOpen(false); setIsCatsOpen(true); }}>
              + Add new category
            </Button>
            <Button onClick={() => setIsBudgetEditorOpen(false)}>Done</Button>
          </div>
        </Modal>
      </div>
    </PullToRefresh>
  );
}