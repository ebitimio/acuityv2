"use client";

import { useState, useEffect } from "react";
import { ScreenHeader, IconButton } from "@/components/ui/screen-header";
import { Pencil } from "lucide-react";
import { getHomeMetrics, updateBudgetLimit, getTransactionsSince, getCategoryBudgets, setCategoryBudgets } from "@/lib/supabase/database";
import { startOfMonthISO } from "@/lib/dates";
import { useCurrency } from "@/lib/currency";
import { GaugeArc } from "@/components/ui/gauge-arc";
import { Modal } from "@/components/ui/modal";
import { Field, Button } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import type { Txn, HomeMetrics } from "@/lib/types";

export function BudgetScreen({ onBack }: { onBack: () => void }) {
  const [metrics, setMetrics] = useState<HomeMetrics | null>(null);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [limit, setLimit] = useState("");
  const [catBudgets, setCatB] = useState<Record<string, number>>({});
  const { fmt } = useCurrency();
  const toast = useToast();

  const load = async () => {
    const [m, t, cb] = await Promise.all([getHomeMetrics(), getTransactionsSince(startOfMonthISO()), getCategoryBudgets()]);
    setMetrics(m); setTxns(t); setCatB(cb);
    setLimit(String(m.budget_limit_minor / 100));
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    try { await updateBudgetLimit(parseFloat(limit) || 0); toast("Budget saved"); setIsEditOpen(false); load(); }
    catch { toast("Could not save", "err"); }
  };

  if (!metrics) return <div className="min-h-[100dvh] bg-black" />;

  const spent = metrics.total_spent_minor / 100;
  const budget = metrics.budget_limit_minor / 100;
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const byCat = new Map<string, number>();
  for (const t of txns) { if (t.direction === "debit") byCat.set(t.category_name || "Uncategorized", (byCat.get(t.category_name || "Uncategorized") ?? 0) + t.amount_minor / 100); }
  const top = [...byCat.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <div className="min-h-[100dvh] bg-black pb-32">
      <ScreenHeader title="Budget" onBack={onBack} right={<IconButton label="Edit" onClick={() => setIsEditOpen(true)}><Pencil size={16} /></IconButton>} />

      <div className="px-4 pt-6 space-y-6">
        <div className="rounded-3xl bg-[var(--surface-2)] border border-[var(--line)] p-6 flex flex-col items-center">
          <p className="text-[13px] text-[var(--text-2)]">{new Date().toLocaleDateString("en-NG", { month: "long", year: "numeric" })}</p>
          <GaugeArc percentage={pct} />
          <p className="text-[13px] text-[var(--text-2)] mt-4">Left to spend</p>
          <p className="text-[28px] font-bold tabular">{fmt(Math.max(budget - spent, 0))}</p>
          <div className="w-full flex justify-between mt-4 pt-4 border-t border-[var(--line)] text-[13px]">
            <div><p className="text-[var(--text-3)]">Budget</p><p className="font-semibold">{fmt(budget)}</p></div>
            <div className="text-right"><p className="text-[var(--text-3)]">Spent</p><p className="font-semibold">{fmt(spent)}</p></div>
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
            {top.length === 0 && <p className="px-4 py-6 text-center text-[14px] text-[var(--text-3)]">No spending this month yet.</p>}
          </div>
        </div>
      </div>

      <Modal open={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Budget">
        <div className="space-y-3">
          <Field label="Monthly budget (₦)" type="number" value={limit} onChange={(e) => setLimit(e.target.value)} />
          <Button onClick={save}>Save</Button>
        </div>
      </Modal>
    </div>
  );
}