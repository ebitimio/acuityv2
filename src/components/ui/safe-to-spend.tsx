"use client";

import { NumberRoll } from "./number-roll";
import { Calendar, AlertTriangle } from "lucide-react";
import type { SafeToSpend as SafeToSpendData } from "@/lib/supabase/database";

interface Props {
  data: SafeToSpendData | null;
}

export function SafeToSpendHero({ data }: Props) {
  if (!data || data.error) {
    return (
      <div>
        <p className="text-[14px] font-medium text-white/70 mb-1">Safe to spend today</p>
        <div className="text-[44px] font-bold tracking-tight text-white leading-none">
          <NumberRoll value={0} showDecimals={false} />
        </div>
        <p className="text-[12px] text-white/60 mt-2">Add an account to see your safe-to-spend number.</p>
      </div>
    );
  }

  const isNegative = data.total_safe_minor < 0;
  const days = data.days_until_next_income;
  const incomeDate = new Date(data.next_income_date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });

  return (
    <div>
      <p className="text-[13px] font-medium text-white/70 mb-1">Safe to spend today</p>
      <div className={`text-[44px] font-bold tracking-tight text-white leading-none ${isNegative ? "text-[var(--danger)]" : ""}`}>
        <NumberRoll value={data.daily_safe_minor / 100} showDecimals={false} />
      </div>
      <div className="flex items-center gap-1.5 mt-2 text-[12px] text-white/70">
        <Calendar size={12} />
        <span>
          {days} {days === 1 ? "day" : "days"} until income ({incomeDate})
        </span>
      </div>
      {isNegative && (
        <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--danger)]/25 border border-white/20">
          <AlertTriangle size={13} className="text-white shrink-0" />
          <p className="text-[12px] text-white">
            ₦{Math.abs(data.total_safe_minor / 100).toLocaleString()} short before payday
          </p>
        </div>
      )}
    </div>
  );
}