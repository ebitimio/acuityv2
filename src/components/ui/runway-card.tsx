"use client";

import { CalendarClock, TrendingUp } from "lucide-react";
import type { SafeToSpend as SafeToSpendData } from "@/lib/supabase/database";
import type { HomeMetrics } from "@/lib/types";

interface Props {
  safe: SafeToSpendData | null;
  metrics: HomeMetrics | null;
  onOpenUpcoming: () => void;
  onOpenBudget: () => void;
}

export function RunwayCards({ safe, metrics, onOpenUpcoming, onOpenBudget }: Props) {
  const liquid = (safe?.liquid_minor ?? 0) / 100;
  const spentThisMonth = (metrics?.total_spent_minor ?? 0) / 100;

  // Rough runway: liquid / (average monthly spend)
  const avgMonthly = spentThisMonth > 0 ? spentThisMonth : 1;
  const runwayMonths = liquid > 0 ? liquid / avgMonthly : 0;
  const runwayRounded = Math.round(runwayMonths * 10) / 10;

  const bills = safe?.upcoming_bills ?? [];
  const nextBill = bills.length > 0 ? bills[0] : null;

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={onOpenUpcoming}
        className="rounded-2xl bg-white/15 backdrop-blur-xl border border-white/25 p-4 text-left hover:bg-white/20 transition-colors"
      >
        <div className="flex items-center gap-1.5 mb-2">
          <CalendarClock size={14} className="text-white/80" />
          <span className="text-[11px] text-white/70">Next bill</span>
        </div>
        <p className="text-[17px] font-semibold text-white truncate">
          {nextBill ? nextBill.name : "None"}
        </p>
        <p className="text-[11px] text-white/60 mt-0.5">
          {nextBill ? `Day ${nextBill.day} · ₦${(nextBill.amount_minor / 100).toLocaleString()}` : "Add bills in Commitments"}
        </p>
      </button>

      <button
        onClick={onOpenBudget}
        className="rounded-2xl bg-white/15 backdrop-blur-xl border border-white/25 p-4 text-left hover:bg-white/20 transition-colors"
      >
        <div className="flex items-center gap-1.5 mb-2">
          <TrendingUp size={14} className="text-white/80" />
          <span className="text-[11px] text-white/70">Runway</span>
        </div>
        <p className="text-[17px] font-semibold text-white">
          {runwayRounded > 0 ? `${runwayRounded} mo` : "—"}
        </p>
        <p className="text-[11px] text-white/60 mt-0.5">
          {liquid > 0 ? "Of current lifestyle" : "Add accounts to estimate"}
        </p>
      </button>
    </div>
  );
}