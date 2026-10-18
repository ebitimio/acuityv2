"use client";

import { ChevronRight, Landmark, PiggyBank, Smartphone, Globe2 } from "lucide-react";
import { useCurrency } from "@/lib/currency";
import type { Account } from "@/lib/types";

const TYPES = {
  checking: { icon: Landmark, label: "Current", color: "#f97316" },
  savings: { icon: PiggyBank, label: "Savings", color: "#5bdc8c" },
  wallet: { icon: Smartphone, label: "Wallet", color: "#7cc8ff" },
  dom: { icon: Globe2, label: "Domiciliary", color: "#bf8cf2" },
} as const;

export function accountTypeLabel(t: string) {
  return (TYPES[t as keyof typeof TYPES] ?? TYPES.checking).label;
}

export function AccountCard({ account, onClick }: { account: Account; onClick: () => void }) {
  const { fmt } = useCurrency();
  const t = TYPES[account.type] ?? TYPES.checking;
  const Icon = t.icon;
  const balance = (account.current_minor ?? account.balance_minor) / 100;

  return (
    <button onClick={onClick} className="press flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-white/[0.03]">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: `${t.color}22`, color: t.color }}>
        <Icon size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[16px] font-semibold">{account.name}</p>
        <p className="truncate text-[13px] text-[var(--text-2)]">{account.institution} ({t.label})</p>
      </div>
      <p className={`tabular text-[16px] font-bold ${balance < 0 ? "text-[var(--danger)]" : ""}`}>{fmt(balance)}</p>
      <ChevronRight size={16} className="text-[var(--text-3)]" />
    </button>
  );
}