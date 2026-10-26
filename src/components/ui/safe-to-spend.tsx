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
}: Props) {
  const { fmt, hidden, toggleHidden } = useCurrency();
  const hasBudget = budgetLimit > 0;
  const budgetUsedPct = hasBudget ? Math.min((spentThisMonth / budgetLimit) * 100, 100) : 0;
  const budgetRemaining = hasBudget ? Math.max(budgetLimit - spentThisMonth, 0) : 0;
  const cycleProgressPct = Math.min(((30 - daysUntilIncome) / 30) * 100, 100);

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

  // Use var(--brand) so it changes dynamically
  const heroBg = "var(--brand)";

  const displayValue = hidden ? "₦••••••" : fmt(netAcross);

  return (
    <div className="p-5 rounded-[24px]" style={{ background: heroBg }}>
      <p className="text-center text-[13px] font-semibold text-black/70">
        {periodLabel}
      </p>

      <div className="mt-3">
        <p className="text-[12px] text-black/70">Net across accounts</p>
        
        <div className="mt-1 flex items-center gap-2">
          <div className="text-[38px] font-bold leading-none tracking-tight text-black">
            {hidden ? (
              <span>{displayValue}</span>
            ) : (
              <span className="[&_span]:!text-black">
                <NumberRoll value={netAcross} showDecimals={false} />
              </span>
            )}
          </div>
          <button
            onClick={toggleHidden}
            aria-label={hidden ? "Show balances" : "Hide balances"}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-black/10 text-black/70 hover:bg-black/20 transition-colors"
          >
            {hidden ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        <p className="mt-1 text-[12px] text-black/70">
          {hidden ? "₦•••• spent this month" : `${fmt(spentThisMonth)} spent this month`}
        </p>
      </div>

      {hasIncome && (
        <div className="mt-3 flex items-center justify-between rounded-xl bg-black px-3 py-2">
          <span className="text-[11px] font-medium text-white">Safe to spend today</span>
          <span className="tabular text-[15px] font-bold text-white">
            {hidden ? "₦••••" : fmt(dailySafe)}
          </span>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] text-black/70">Income</p>
          <p className="mt-0.5 text-[15px] font-semibold" style={{ color: "#22c55e" }}>
            {hidden ? "₦••••" : fmt(actualIncome > 0 ? actualIncome : 0)}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-black/70">Net liquid assets</p>
          <p className="mt-0.5 text-[15px] font-semibold text-black">
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
            <p className="truncate text-[11px] text-black/70">Monthly budget</p>
            <p className="tabular shrink-0 text-[11px] text-black/80">
              {hasBudget ? (hidden ? "₦•••• left" : `${fmt(budgetRemaining)} left`) : "Not set"}
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