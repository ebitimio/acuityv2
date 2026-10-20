"use client";

import { ChevronRight, Landmark, PiggyBank, Smartphone, Globe2 } from "lucide-react";
import { useCurrency } from "@/lib/currency";
import type { Account } from "@/lib/types";

const TYPES = {
  checking: { icon: Landmark, label: "Current", color: "#6fa3c7" },
  savings: { icon: PiggyBank, label: "Savings", color: "#52c28a" },
  wallet: { icon: Smartphone, label: "Wallet", color: "#46a3b0" },
  dom: { icon: Globe2, label: "Domiciliary", color: "#9a86c9" },
} as const;

export function accountTypeLabel(t: string) {
  return (TYPES[t as keyof typeof TYPES] ?? TYPES.checking).label;
}

export function AccountCard({
  account,
  onClick,
  compact = false,
}: {
  account: Account;
  onClick: () => void;
  compact?: boolean;
}) {
  const { fmt } = useCurrency();
  const t = TYPES[account.type] ?? TYPES.checking;
  const Icon = t.icon;
  const balance = (account.current_minor ?? account.balance_minor) / 100;

  return (
    <button
      onClick={onClick}
      className={`press flex flex-1 min-w-0 items-center gap-3 text-left ${compact ? "py-0" : "px-4 py-4 hover:bg-[var(--fill-1)]"}`}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
        style={{ background: `${t.color}22`, color: t.color }}
      >
        <Icon size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-[var(--text-1)]">{account.name}</p>
        <p className="truncate text-[12px] text-[var(--text-2)]">
          {account.institution} ({t.label})
        </p>
      </div>
      {!compact && (
        <>
          <p className={`tabular text-[15px] font-bold ${balance < 0 ? "text-[var(--danger)]" : "text-[var(--text-1)]"}`}>
            {fmt(balance)}
          </p>
          <ChevronRight size={16} className="text-[var(--text-3)]" />
        </>
      )}
    </button>
  );
}