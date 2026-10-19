"use client";

import { NumberRoll } from "./number-roll";
import { TrendingUp, TrendingDown, Calendar, AlertTriangle } from "lucide-react";
import type { SafeToSpend as SafeToSpendData } from "@/lib/supabase/database";

interface Props {
  data: SafeToSpendData | null;
  onOpenUpcoming: () => void;
}

export function SafeToSpendHero({ data, onOpenUpcoming }: Props) {
  if (!data || data.error) {
    return (
      <div>
        <p className="text-[14px] font-medium text-white/70 mb-1">Safe to spend today</p>
        <div className="text-[48px] font-bold tracking-tight text-white flex items-start gap-1">
          <NumberRoll value={0} />
        </div>
        <p className="text-[13px] text-white/60 mt-2">Add an account to see your safe-to-spend number.</p>
      </div>
    );
  }

  const isNegative = data.total_safe_minor < 0;
  const isLow = data.daily_safe_minor < 200000 && !isNegative; // < ₦2,000/day
  const days = data.days_until_next_income;
  const incomeDate = new Date(data.next_income_date).toLocaleDateString("en-NG", { day: "numeric", month: "short" });

  return (
    <div>
      <p className="text-[14px] font-medium text-white/70 mb-1">Safe to spend today</p>
      <div className={`text-[48px] font-bold tracking-tight text-white flex items-start gap-1 ${isNegative ? "text-[var(--danger)]" : ""}`}>
        <NumberRoll value={data.daily_safe_minor / 100} showDecimals={false} />
      </div>

      <div className="flex items-center gap-3 mt-2 text-[13px] text-white/70">
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {days} {days === 1 ? "day" : "days"} until income ({incomeDate})
        </span>
      </div>

      {isNegative && (
        <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--danger)]/20 border border-[var(--danger)]/40">
          <AlertTriangle size={14} className="text-white shrink-0" />
          <p className="text-[12px] text-white">
            You are ₦{Math.abs(data.total_safe_minor / 100).toLocaleString()} short before payday
          </p>
        </div>
      )}

      {!isNegative && (
        <button
          onClick={onOpenUpcoming}
          className="mt-3 w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 transition-colors"
        >
          <span className="text-[12px] text-white/80">
            ₦{(data.total_safe_minor / 100).toLocaleString()} total available
          </span>
          <span className="text-[12px] text-white/80">
            {data.bills_due_minor > 0
              ? `After ₦${(data.bills_due_minor / 100).toLocaleString()} in bills`
              : "No bills due"}
          </span>
        </button>
      )}
    </div>
  );
}