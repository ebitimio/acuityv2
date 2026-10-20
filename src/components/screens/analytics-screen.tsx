"use client";

import { useEffect, useState } from "react";
import { ScreenHeader } from "@/components/ui/screen-header";
import { getTransactionsSince } from "@/lib/supabase/database";
import { startOfMonthISO } from "@/lib/dates";
import { useCurrency } from "@/lib/currency";
import { BarPairChart } from "@/components/ui/bar-pair-chart";
import type { Txn } from "@/lib/types";
import { EmptyState } from "@/components/ui/empty-state";
import { BarChart3 } from "lucide-react";

export function AnalyticsScreen({ onBack }: { onBack: () => void }) {
  const [txns, setTxns] = useState<Txn[]>([]);
  const { fmt } = useCurrency();

  useEffect(() => {
    getTransactionsSince(startOfMonthISO()).then(setTxns);
  }, []);

  const income = txns.filter((t) => t.direction === "credit").reduce((s, t) => s + t.amount_minor / 100, 0);
  const expense = txns.filter((t) => t.direction === "debit").reduce((s, t) => s + t.amount_minor / 100, 0);
  const net = income - expense;

  const weeks = [
    { label: "W1", income: 0, expense: 0 },
    { label: "W2", income: 0, expense: 0 },
    { label: "W3", income: 0, expense: 0 },
    { label: "W4", income: 0, expense: 0 },
  ];
  for (const t of txns) {
    const w = Math.min(Math.floor((new Date(t.date).getDate() - 1) / 7), 3);
    if (t.direction === "credit") weeks[w].income += t.amount_minor / 100;
    else weeks[w].expense += t.amount_minor / 100;
  }

  const byCat = new Map<string, number>();
  for (const t of txns.filter((t) => t.direction === "debit")) {
    const k = t.category_name || "Uncategorized";
    byCat.set(k, (byCat.get(k) ?? 0) + t.amount_minor / 100);
  }
  const top = [...byCat.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <div className="min-h-[100dvh] pb-32">
      <ScreenHeader title="Analytics" onBack={onBack} />
      <div className="space-y-5 px-4 pt-6">
        <div className="card p-6">
          <p className="mb-1 text-[13px] text-[var(--text-2)]">Cashflow this month</p>
          <p className={`text-[32px] font-bold tabular ${net >= 0 ? "text-[var(--gain)]" : "text-[var(--danger)]"}`}>
            {net >= 0 ? "+" : ""}
            {fmt(net)}
          </p>
          <div className="mt-4">
            <BarPairChart data={weeks} />
          </div>
        </div>

        <div className="card p-6">
          <p className="mb-3 text-[15px] font-semibold text-[var(--text-1)]">Spending by category</p>
          {top.length === 0 ? (
            <EmptyState icon={BarChart3} title="No data yet" body="Import a statement to see spending analytics." />
          ) : (
            <div className="space-y-2">
              {top.map(([name, amt]) => (
                <div key={name} className="flex justify-between text-[14px]">
                  <span className="text-[var(--text-1)]">{name}</span>
                  <span className="tabular font-semibold text-[var(--text-1)]">{fmt(amt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}