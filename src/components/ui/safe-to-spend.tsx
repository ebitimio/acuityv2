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
  const hasBudget = budgetLimit > 0;
  const budgetUsedPct = hasBudget ? Math.min((spentThisMonth / budgetLimit) * 100, 100) : 0;
  const budgetRemaining = hasBudget ? Math.max(budgetLimit - spentThisMonth, 0) : 0;
  const cycleProgressPct = Math.min(((30 - daysUntilIncome) / 30) * 100, 100);

  // Daily safe-to-spend from the RPC. Fallback to 0 if no data.
  const dailySafe = data?.daily_safe_minor ? data.daily_safe_minor / 100 : 0;
  const hasIncome = data?.has_income ?? false;

  return (
    <div className="card p-5">
      <p className="text-center text-[13px] font-semibold text-[var(--text-2)]">
        {periodLabel}
      </p>

      {/* Net across accounts hero */}
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

      {/* Safe to spend today — highlighted pill */}
      {hasIncome && (
        <div className="mt-3 flex items-center justify-between rounded-xl bg-[var(--brand)]/10 px-3 py-2">
          <span className="text-[11px] font-medium text-[var(--brand)]">Safe to spend today</span>
          <span className="tabular text-[15px] font-bold text-[var(--brand)]">
            {fmt(dailySafe)}
          </span>
        </div>
      )}

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

      {/* Ring + progress bars — only show if budget is set */}
      <div className="mt-4 grid grid-cols-[44px_1fr] gap-3">
        <RingProgress
          percentage={hasBudget ? budgetUsedPct : 0}
          label={hasBudget ? `${Math.round(budgetUsedPct)}%` : "—"}
        />
        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-[11px] text-[var(--text-3)]">Monthly budget</p>
            <p className="tabular shrink-0 text-[11px] text-[var(--text-2)]">
              {hasBudget ? `${fmt(budgetRemaining)} left` : "Not set"}
            </p>
          </div>
          <div className="mt-1 h-[3px] w-full overflow-hidden rounded-full bg-[var(--fill-2)]">
            <div
              className="h-full rounded-full bg-[var(--brand)]"
              style={{ width: `${hasBudget ? budgetUsedPct : 0}%` }}
            />
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <p className="truncate text-[11px] text-[var(--text-3)]">Cycle progress</p>
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