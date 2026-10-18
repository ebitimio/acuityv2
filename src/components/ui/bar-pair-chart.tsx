"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useCurrency } from "@/lib/currency";

export interface BarData {
  label: string;
  income: number;
  expense: number;
}

export function BarPairChart({ data }: { data: BarData[] }) {
  const { fmt } = useCurrency();
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...data.flatMap((d) => [d.income, d.expense]), 1);
  const h = (v: number) => (v > 0 ? `${Math.max((v / max) * 100, 3)}%` : "0%");

  return (
    <div>
      <div className="mb-3 h-5 text-center text-[13px] font-semibold tabular text-[var(--text-2)]">
        {active !== null && (
          <>
            <span className="text-[var(--gain)]">{fmt(data[active].income, { force: true })} in</span>
            <span className="mx-2 text-[var(--text-3)]">/</span>
            <span>{fmt(data[active].expense, { force: true })} out</span>
          </>
        )}
      </div>
      <div className="flex h-32 w-full items-end gap-2">
        {data.map((d, i) => (
          <button
            key={d.label + i}
            onClick={() => setActive(active === i ? null : i)}
            className="flex h-full flex-1 flex-col items-center justify-end gap-2"
            aria-label={`${d.label}: ${fmt(d.income, { force: true })} in, ${fmt(d.expense, { force: true })} out`}
          >
            <div className="flex h-full w-full items-end justify-center gap-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: h(d.income) }}
                transition={{ type: "spring", stiffness: 260, damping: 28, delay: i * 0.04 }}
                className="w-1/2 max-w-[14px] rounded-t-md bg-[var(--gain)]"
                style={{ opacity: active === null || active === i ? 1 : 0.35 }}
              />
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: h(d.expense) }}
                transition={{ type: "spring", stiffness: 260, damping: 28, delay: i * 0.04 + 0.04 }}
                className="w-1/2 max-w-[14px] rounded-t-md bg-white/35"
                style={{ opacity: active === null || active === i ? 1 : 0.35 }}
              />
            </div>
            <span className="text-[12px] text-[var(--text-3)]">{d.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}