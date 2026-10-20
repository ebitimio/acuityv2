"use client";

import { CalendarDays, FileText, Users, Wallet, Receipt, TrendingUp } from "lucide-react";
import { useRef } from "react";

const tools = [
  { key: "commitments", icon: CalendarDays, label: "Commitments", desc: "Bills & funds" },
  { key: "tax", icon: FileText, label: "Tax", desc: "PIT & LIRS" },
  { key: "ajo", icon: Users, label: "Ajo", desc: "Cooperative groups" },
  { key: "budget", icon: Wallet, label: "Budget", desc: "Spending limits" },
  { key: "bank-charge", icon: Receipt, label: "Bank charges", desc: "Fee analysis" },
  { key: "analytics", icon: TrendingUp, label: "Analytics", desc: "Insights" },
];

export function ToolsScroller({ onNavigate }: { onNavigate: (key: string) => void }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-[15px] font-semibold text-[var(--text-1)]">Tools</h3>
      </div>
      <div
        ref={scrollerRef}
        className="flex gap-3 overflow-x-auto pb-2 no-scrollbar"
      >
        {tools.map((tool) => (
          <button
            key={tool.key}
            onClick={() => onNavigate(tool.key)}
            className="press flex min-w-[140px] flex-col items-start gap-3 rounded-[18px] border border-[var(--line)] bg-[var(--surface-2)] p-4 text-left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--fill-2)]">
              <tool.icon size={20} color="#DE3121" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[var(--text-1)]">{tool.label}</p>
              <p className="text-[11px] text-[var(--text-3)]">{tool.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}