"use client";

import { NumberRoll } from "./number-roll";
import { Calendar, AlertTriangle } from "lucide-react";
import type { SafeToSpend as SafeToSpendData } from "@/lib/supabase/database";

interface Props {
  data: SafeToSpendData | null;
  netAcross: number;
  hasAccounts: boolean;
}

export function SafeToSpendHero({ data, netAcross, hasAccounts }: Props) {
  const isNegativeNet = netAcross < 0;
  const dailySafe = data && !data.error ? data.daily_safe_minor / 100 : 0;
  const days = data && !data.error ? data.days_until_next_income : 0;
  const incomeDate =
    data && !data.error && data.next_income_date
      ? new Date(data.next_income_date).toLocaleDateString("en-NG", { day: "numeric", month: "short" })
      : "";
  const isNegativeSafe = data && !data.error && data.total_safe_minor < 0;

  return (
    <div>
      <p className="text-[13px] font-medium text-white/70 mb-1">Net across all accounts</p>
      <div
        className={`text-[44px] font-bold tracking-tight leading-none ${
          isNegativeNet ? "text-[var(--danger)]" : "text-white"
        }`}
      >
        <NumberRoll value={netAcross} showDecimals={false} />
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-[13px] text-white/70">Safe to spend today</span>
        <span className="text-[17px] font-semibold text-white tabular">
          ₦{dailySafe.toLocaleString()}
        </span>
        {days > 0 && (
          <span className="text-[11px] text-white/60 ml-1">· {days}d until {incomeDate}</span>
        )}
      </div>

      {hasAccounts && !isNegativeSafe && (
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-white/60">
          <Calendar size={11} />
          <span>
            ₦{((data?.total_safe_minor ?? 0) / 100).toLocaleString()} available until next income
          </span>
        </div>
      )}

      {isNegativeSafe && (
        <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--danger)]/25 border border-white/20">
          <AlertTriangle size={13} className="text-white shrink-0" />
          <p className="text-[12px] text-white">
            ₦{Math.abs((data!.total_safe_minor ?? 0) / 100).toLocaleString()} short before payday
          </p>
        </div>
      )}
    </div>
  );
}