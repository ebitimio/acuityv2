"use client";

import { NumberRoll } from "./number-roll";
import { RingProgress } from "./ring-progress";
import { useCurrency } from "@/lib/currency";
import type { SafeToSpend as SafeToSpendData } from "@/lib/supabase/database";

interface Props {
  data: SafeToSpendData | null;
  netAcross: number;
  spentThisMonth: number;
  incomeThisMonth: number;
  budgetLimit: number;
  periodLabel: string;
  daysUntilIncome: number;
  nextIncomeDate: string;
}

export function SafeToSpendHero({
  data,
  netAcross,
  spentThisMonth,
  incomeThisMonth,
  budgetLimit,
  periodLabel,
  daysUntilIncome,
  nextIncomeDate,
}: Props) {
  const { fmt } = useCurrency();
  const isNegativeNet = netAcross < 0;
  const budgetUsedPct = budgetLimit > 0 ? Math.min((spentThisMonth / budgetLimit) * 100, 100) : 0;
  const budgetRemaining = Math.max(budgetLimit - spentThisMonth, 0);
  // Cycle progress: assume a ~30-day cycle
  const cycleProgressPct = Math.min(((30 - daysUntilIncome) / 30) * 100, 100);

  return (
    <div className="card p-5">
      {/* Period centered */}
      <p className="text-center text-[13px] font-semibold text-[var(--text-2)]">
        {periodLabel}
      </p>

      {/* Net across accounts — hero figure */}
      <div className="mt-3">
        <p className="text-[12px] text-[var(--text-3)]">Net across accounts</p>
        <div
          className={`mt-1 text-[38px] font-bold leading-none tracking-tight ${
            isNegativeNet ? "text-[var(--danger)]" : "text-[var(--text-1)]"
          }`}
        >
          <NumberRoll value={netAcross} showDecimals={false} />
        </div>
        <p className="mt-1 text-[12px] text-[var(--text-3)]">
          {fmt(spentThisMonth)} spent this month
        </p>
      </div>

      {/* Income / Balance columns */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] text-[var(--text-3)]">Income</p>
          <p className="mt-0.5 text-[15px] font-semibold text-[var(--gain)]">
            {fmt(incomeThisMonth)}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-[var(--text-3)]">Balance</p>
          <p className="mt-0.5 text-[15px] font-semibold text-[var(--text-1)]">
            {fmt(netAcross)}
          </p>
        </div>
      </div>

      {/* Ring + days progress */}
      <div className="mt-4 grid grid-cols-[44px_1fr] gap-3">
        <RingProgress percentage={budgetUsedPct} label={`${Math.round(budgetUsedPct)}%`} />
        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-[11px] text-[var(--text-3)]">Monthly budget</p>
            <p className="tabular shrink-0 text-[11px] text-[var(--text-2)]">
              {fmt(budgetRemaining)} left
            </p>
          </div>
          <div className="mt-1 h-[3px] w-full overflow-hidden rounded-full bg-[var(--fill-2)]">
            <div
              className="h-full rounded-full bg-[var(--brand)]"
              style={{ width: `${budgetUsedPct}%` }}
            />
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <p className="truncate text-[11px] text-[var(--text-3)]">Safe to spend today</p>
            <p className="tabular shrink-0 text-[11px] text-[var(--text-2)]">
              {daysUntilIncome > 0 ? `${daysUntilIncome}d until ${nextIncomeDate}` : "No income set"}
            </p>
          </div>
          <div className="mt-1 h-[3px] w-full overflow-hidden rounded-full bg-[var(--fill-2)]">
            <div
              className="h-full rounded-full bg-[var(--text-1)]"
              style={{ width: `${cycleProgressPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}