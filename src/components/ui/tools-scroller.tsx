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
            // Force dark background and border
            className="press flex min-w-[140px] flex-col items-start gap-3 rounded-[18px] border border-white/5 bg-[#1c1c1e] p-4 text-left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <tool.icon size={20} color="#DE3121" />
            </div>
            <div>
              {/* Force white text */}
              <p className="text-[14px] font-semibold text-white">{tool.label}</p>
              <p className="text-[11px] text-white/50">{tool.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}