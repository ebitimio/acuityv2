"use client";

import { NumberRoll } from "./number-roll";
import { RingProgress } from "./ring-progress";
import { useCurrency } from "@/lib/currency";
import type { SafeToSpend as SafeToSpendData } from "@/lib/supabase/database";
import { useEffect, useState } from "react";
import { getRecurringItems, getFamilySupport } from "@/lib/supabase/database";
import { Eye, EyeOff } from "lucide-react";

interface Props {
  data: SafeToSpendData | null;
  netAcross: number;
  liquidAssets: number;
  spentThisMonth: number;
  incomeThisMonth: number;
  budgetLimit: number;
  periodLabel: string;
  daysUntilIncome: number;
  nextIncomeDate: string;
  cycleBounds?: { cycle_start: string; cycle_end: string } | null;
}

export function SafeToSpendHero({
  data,
  netAcross,
  liquidAssets,
  spentThisMonth,
  incomeThisMonth,
  budgetLimit,
  periodLabel,
  daysUntilIncome,
  nextIncomeDate,
  cycleBounds,
}: Props) {
  const { fmt, hidden, toggleHidden } = useCurrency();
  const hasBudget = budgetLimit > 0;
  const budgetUsedPct = hasBudget ? Math.min((spentThisMonth / budgetLimit) * 100, 100) : 0;
  const budgetRemaining = hasBudget ? Math.max(budgetLimit - spentThisMonth, 0) : 0;

  let totalCycleDays = 30;
  let elapsedDays = Math.max(0, 30 - daysUntilIncome);

  if (cycleBounds?.cycle_start && cycleBounds?.cycle_end) {
    const start = new Date(cycleBounds.cycle_start).getTime();
    const end = new Date(cycleBounds.cycle_end).getTime();
    const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      totalCycleDays = diffDays;
      const now = Date.now();
      const elapsed = Math.round((now - start) / (1000 * 60 * 60 * 24));
      elapsedDays = Math.max(0, Math.min(elapsed, totalCycleDays));
    }
  }

  const cycleProgressPct = totalCycleDays > 0 ? Math.min(Math.max((elapsedDays / totalCycleDays) * 100, 0), 100) : 0;

  const dailySafe = data?.daily_safe_minor ? data.daily_safe_minor / 100 : 0;
  const hasIncome = data?.has_income ?? false;

  const [expectedIncome, setExpectedIncome] = useState(0);
  const [totalObligations, setTotalObligations] = useState(0);

  useEffect(() => {
    async function loadCommitments() {
      try {
        const items = await getRecurringItems();
        const family = await getFamilySupport();
        
        const incomeSum = items.filter(i => i.kind === "income").reduce((s, i) => s + i.amount_minor / 100, 0);
        const billsSum = items.filter(i => i.kind === "bill").reduce((s, i) => s + i.amount_minor / 100, 0);
        const familySum = family.amount_minor / 100;

        setExpectedIncome(incomeSum);
        setTotalObligations(billsSum + familySum);
      } catch (e) {
        console.error(e);
      }
    }
    loadCommitments();
  }, []);

  const actualIncome = expectedIncome - totalObligations;

  const heroBg = "var(--brand)";
  const displayValue = hidden ? "₦••••••" : fmt(netAcross);

  return (
    <div className="p-5 rounded-[24px]" style={{ background: heroBg }}>
      <p className="text-center text-[13px] font-bold text-black tracking-wide">
        {periodLabel}
      </p>

      <div className="mt-3">
        <p className="text-[12.5px] font-semibold text-black">Net across accounts</p>
        
        <div className="mt-1 flex items-center gap-2">
          <div className="text-[38px] font-black leading-none tracking-tight text-black font-hero">
            {hidden ? (
              <span>{displayValue}</span>
            ) : (
              <span className="[&_span]:!text-black [&_span]:!opacity-100 font-black font-hero">
                <NumberRoll value={netAcross} showDecimals={false} className="font-hero font-black" />
              </span>
            )}
          </div>
          <button
            onClick={toggleHidden}
            aria-label={hidden ? "Show balances" : "Hide balances"}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-black/15 text-black hover:bg-black/25 transition-colors"
          >
            {hidden ? <EyeOff size={15} strokeWidth={2.4} /> : <Eye size={15} strokeWidth={2.4} />}
          </button>
        </div>

        <p className="mt-1 text-[12.5px] font-semibold text-black">
          {hidden ? "₦•••• spent this month" : <><span className="font-hero font-bold">{fmt(spentThisMonth)}</span> spent this month</>}
        </p>
      </div>

      {hasIncome && (
        <div className="mt-3 flex items-center justify-between rounded-xl bg-black px-3 py-2">
          <span className="text-[11.5px] font-semibold text-white">Safe to spend today</span>
          <span className="tabular text-[15px] font-bold text-white font-hero">
            {hidden ? "₦••••" : fmt(dailySafe)}
          </span>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11.5px] font-semibold text-black">Income</p>
          <p className="mt-0.5 text-[16px] font-bold text-black font-hero">
            {hidden ? "₦••••" : fmt(actualIncome > 0 ? actualIncome : 0)}
          </p>
        </div>
        <div>
          <p className="text-[11.5px] font-semibold text-black">Net liquid assets</p>
          <p className="mt-0.5 text-[16px] font-bold text-black font-hero">
            {hidden ? "₦••••" : fmt(liquidAssets)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[44px_1fr] gap-3">
        <RingProgress
          percentage={hasBudget ? budgetUsedPct : 0}
          label={hasBudget ? `${Math.round(budgetUsedPct)}%` : "—"}
        />
        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-[11.5px] font-semibold text-black">Monthly budget</p>
            <p className="tabular shrink-0 text-[11.5px] font-bold text-black font-hero">
              {hasBudget ? (hidden ? "₦•••• left" : `${fmt(budgetRemaining)} left`) : "Not set"}
            </p>
          </div>
          <div className="mt-1 h-[3.5px] w-full overflow-hidden rounded-full bg-black/25">
            <div
              className="h-full rounded-full bg-black"
              style={{ width: `${hasBudget ? budgetUsedPct : 0}%` }}
            />
          </div>
          
          <div className="mt-2.5 flex items-baseline justify-between gap-2">
            <p className="truncate text-[11.5px] font-semibold text-black">Cycle progress</p>
            <p className="tabular shrink-0 text-[11.5px] font-bold text-black font-hero">
              {hasIncome
                ? daysUntilIncome > 0
                  ? `${daysUntilIncome}d until ${nextIncomeDate}`
                  : `Payday today (${nextIncomeDate})`
                : "No income set"}
            </p>
          </div>
          <div className="mt-1 h-[3.5px] w-full overflow-hidden rounded-full bg-black/25">
            <div
              className="h-full rounded-full bg-black"
              style={{ width: `${cycleProgressPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}