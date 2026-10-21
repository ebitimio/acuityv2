"use client";

import { NumberRoll } from "./number-roll";
import { RingProgress } from "./ring-progress";
import { useCurrency } from "@/lib/currency";
import type { SafeToSpend as SafeToSpendData } from "@/lib/supabase/database";
import { useEffect, useState } from "react";
import { getRecurringItems, getFamilySupport } from "@/lib/supabase/database";
import type { RecurringItem } from "@/lib/types";

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
  const hasBudget = budgetLimit > 0;
  const budgetUsedPct = hasBudget ? Math.min((spentThisMonth / budgetLimit) * 100, 100) : 0;
  const budgetRemaining = hasBudget ? Math.max(budgetLimit - spentThisMonth, 0) : 0;
  const cycleProgressPct = Math.min(((30 - daysUntilIncome) / 30) * 100, 100);

  const dailySafe = data?.daily_safe_minor ? data.daily_safe_minor / 100 : 0;
  const hasIncome = data?.has_income ?? false;

  // New state for expected income vs actual liquid
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

  const heroBg = "#DE3121";

  return (
    <div className="p-5 rounded-[24px]" style={{ background: heroBg }}>
      <p className="text-center text-[13px] font-semibold text-black/70">
        {periodLabel}
      </p>

      <div className="mt-3">
        <p className="text-[12px] text-black/70">Net across accounts</p>
        <div className="mt-1 text-[38px] font-bold leading-none tracking-tight text-black">
          <span className="[&_span]:!text-black">
            <NumberRoll value={netAcross} showDecimals={false} />
          </span>
        </div>
        <p className="mt-1 text-[12px] text-black/70">
          {fmt(spentThisMonth)} spent this month
        </p>
      </div>

      {hasIncome && (
        <div className="mt-3 flex items-center justify-between rounded-xl bg-black px-3 py-2">
          <span className="text-[11px] font-medium text-white">Safe to spend today</span>
          <span className="tabular text-[15px] font-bold text-white">
            {fmt(dailySafe)}
          </span>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] text-black/70">Income</p>
          {/* Uses expected income minus obligations */}
          <p className="mt-0.5 text-[15px] font-semibold" style={{ color: "#22c55e" }}>
            {fmt(actualIncome > 0 ? actualIncome : 0)}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-black/70">Net Liquid</p>
          {/* Uses only liquid cash, not total net worth */}
          <p className="mt-0.5 text-[15px] font-semibold text-black">
            {fmt(netAcross)}
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
            <p className="truncate text-[11px] text-black/70">Monthly budget</p>
            <p className="tabular shrink-0 text-[11px] text-black/80">
              {hasBudget ? `${fmt(budgetRemaining)} left` : "Not set"}
            </p>
          </div>
          <div className="mt-1 h-[3px] w-full overflow-hidden rounded-full bg-black/20">
            <div
              className="h-full rounded-full bg-black"
              style={{ width: `${hasBudget ? budgetUsedPct : 0}%` }}
            />
          </div>
          
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <p className="truncate text-[11px] text-black/70">Cycle progress</p>
            <p className="tabular shrink-0 text-[11px] text-black/80">
              {daysUntilIncome > 0 ? `${daysUntilIncome}d until ${nextIncomeDate}` : "No income set"}
            </p>
          </div>
          <div className="mt-1 h-[3px] w-full overflow-hidden rounded-full bg-black/20">
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