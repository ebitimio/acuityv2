"use client";

import { useEffect, useState } from "react";
import { ScreenHeader, IconButton } from "@/components/ui/screen-header";
import { Pencil, Settings2, CalendarRange } from "lucide-react";
import {
  getHomeMetrics, updateBudgetLimit, getTransactionsSince, getAccounts,
  getCurrentCycle, updateCycleStartDay, getCustomCategories, addCustomCategory, deleteCustomCategory,
} from "@/lib/supabase/database";
import { startOfMonthISO } from "@/lib/dates";
import { useCurrency } from "@/lib/currency";
import { GaugeArc } from "@/components/ui/gauge-arc";
import { Modal } from "@/components/ui/modal";
import { Field, Button } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import type { Txn, HomeMetrics, Account, CustomCategory } from "@/lib/types";

export function BudgetScreen({ onBack }: { onBack: () => void }) {
  const [metrics, setMetrics] = useState<HomeMetrics | null>(null);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [cycle, setCycle] = useState<{ cycle_start: string; cycle_end: string } | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [limit, setLimit] = useState("");
  const [isCycleOpen, setIsCycleOpen] = useState(false);
  const [cycleDay, setCycleDay] = useState("1");
  const [isCatsOpen, setIsCatsOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const { fmt } = useCurrency();
  const toast = useToast();

  const load = async () => {
    const [m, t, accs, cats, cyc] = await Promise.all([
      getHomeMetrics(),
      getTransactionsSince(startOfMonthISO()),
      getAccounts(),
      getCustomCategories(),
      getCurrentCycle(),
    ]);
    setMetrics(m);
    setTxns(t);
    setAccounts(accs);
    setCategories(cats);
    setCycle(cyc);
    setLimit(String(m.budget_limit_minor / 100));
    setCycleDay("1");
  };
  useEffect(() => { load(); }, []);

  const saveLimit = async () => {
    try {
      await updateBudgetLimit(parseFloat(limit) || 0);
      toast("Budget saved");
      setIsEditOpen(false);
      load();
    } catch (e: any) {
      toast(e.message ?? "Could not save", "err");
    }
  };

  const saveCycle = async () => {
    try {
      await updateCycleStartDay(parseInt(cycleDay));
      toast("Payday cycle saved");
      setIsCycleOpen(false);
      load();
    } catch (e: any) {
      toast(e.message ?? "Could not save", "err");
    }
  };

  const addCat = async () => {
    if (!newCatName.trim()) return;
    try {
      await addCustomCategory(newCatName.trim());
      setNewCatName("");
      load();
    } catch (e: any) {
      toast(e.message ?? "Could not add", "err");
    }
  };

  const removeCat = async (id: string) => {
    if (!confirm("Delete this category? Existing transactions keep their label.")) return;
    await deleteCustomCategory(id);
    load();
  };

  if (!metrics) return <div className="min-h-[100dvh] bg-black" />;

  const filteredTxns = selectedAccount === "all"
    ? txns
    : txns.filter((t) => t.account_id === selectedAccount);

  const spent = filteredTxns.filter((t) => t.direction === "debit").reduce((s, t) => s + t.amount_minor, 0) / 100;
  const budget = metrics.budget_limit_minor / 100;
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

  const byCat = new Map<string, number>();
  for (const t of filteredTxns) {
    if (t.direction === "debit") {
      const k = t.category_name || "Uncategorized";
      byCat.set(k, (byCat.get(k) ?? 0) + t.amount_minor / 100);
    }
  }
  const top = [...byCat.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);

  const cycleLabel = cycle
    ? `${new Date(cycle.cycle_start).toLocaleDateString("en-NG", { day: "numeric", month: "short" })} → ${new Date(cycle.cycle_end).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}`
    : "";

  return (
    <div className="min-h-[100dvh] bg-black pb-32">
      <ScreenHeader
        title="Budget"
        onBack={onBack}
        right={
          <div className="flex gap-2">
            <IconButton label="Cycle" onClick={() => setIsCycleOpen(true)}>
              <CalendarRange size={16} />
            </IconButton>
            <IconButton label="Edit budget" onClick={() => setIsEditOpen(true)}>
              <Pencil size={16} />
            </IconButton>
            <IconButton label="Manage categories" onClick={() => setIsCatsOpen(true)}>
              <Settings2 size={16} />
            </IconButton>
          </div>
        }
      />

      <div className="px-4 pt-6 space-y-5">
        {/* Cycle + account picker */}
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedAccount("all")}
            className={`px-3 py-1.5 rounded-full text-[12px] font-semibold ${
              selectedAccount === "all" ? "bg-[var(--brand)] text-white" : "bg-white/10 text-white/70"
            }`}
          >
            All accounts
          </button>
          {accounts.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedAccount(a.id)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap ${
                selectedAccount === a.id ? "bg-[var(--brand)] text-white" : "bg-white/10 text-white/70"
              }`}
            >
              {a.name}
            </button>
          ))}
        </div>

        {cycleLabel && (
          <p className="text-[12px] text-[var(--text-3)] px-1">Current cycle: {cycleLabel}</p>
        )}

        <div className="rounded-3xl bg-[var(--surface-2)] border border-[var(--line)] p-6 flex flex-col items-center">
          <GaugeArc percentage={pct} />
          <p className="text-[13px] text-[var(--text-2)] mt-4">Left to spend</p>
          <p className="text-[28px] font-bold tabular">{fmt(Math.max(budget - spent, 0))}</p>
          <div className="w-full flex justify-between mt-4 pt-4 border-t border-[var(--line)] text-[13px]">
            <div>
              <p className="text-[var(--text-3)]">Budget</p>
              <p className="font-semibold">{fmt(budget)}</p>
            </div>
            <div className="text-right">
              <p className="text-[var(--text-3)]">Spent</p>
              <p className="font-semibold">{fmt(spent)}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-[15px] font-semibold mb-3 px-1">By category</h3>
          <div className="group-list">
            {top.map(([name, amt]) => (
              <div key={name} className="flex items-center justify-between px-4 py-3">
                <span className="text-[15px]">{name}</span>
                <span className="tabular font-semibold">{fmt(amt)}</span>
              </div>
            ))}
            {top.length === 0 && (
              <p className="px-4 py-6 text-center text-[14px] text-[var(--text-3)]">
                No spending this cycle yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Edit monthly budget */}
      <Modal open={isEditOpen} onClose={() => setIsEditOpen(false)} title="Monthly budget">
        <div className="space-y-3">
          <Field label="Amount (₦)" type="number" value={limit} onChange={(e) => setLimit(e.target.value)} />
          <Button onClick={saveLimit}>Save</Button>
        </div>
      </Modal>

      {/* Edit payday cycle */}
      <Modal open={isCycleOpen} onClose={() => setIsCycleOpen(false)} title="Payday cycle">
        <div className="space-y-3">
          <p className="text-[13px] text-[var(--text-2)]">
            Which day do you get paid? We'll use this as the start of your budget cycle.
          </p>
          <Field label="Day of month (1-28)" type="number" value={cycleDay} onChange={(e) => setCycleDay(e.target.value)} />
          <Button onClick={saveCycle}>Save</Button>
        </div>
      </Modal>

      {/* Manage custom categories */}
      <Modal open={isCatsOpen} onClose={() => setIsCatsOpen(false)} title="Custom categories">
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Church, Black tax"
              className="flex-1 h-11 px-3 rounded-xl bg-[var(--surface-1)] border border-[var(--line-strong)] text-[14px]"
            />
            <Button onClick={addCat} className="!w-auto px-4 !h-11">Add</Button>
          </div>
          <div className="space-y-1">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--surface-1)]">
                <span className="text-[14px]">{c.name}</span>
                <button onClick={() => removeCat(c.id)} className="text-[var(--danger)] text-[12px]">Delete</button>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-[13px] text-[var(--text-3)] text-center py-4">
                No custom categories yet.
              </p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}