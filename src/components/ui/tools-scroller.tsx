"use client";

import { CalendarDays, FileText, Users, ShieldAlert } from "lucide-react";

interface Tool {
  key: "commitments" | "tax" | "ajo" | "bank-charge";
  title: string;
  caption: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const TOOLS: Tool[] = [
  { key: "commitments", title: "Commitments", caption: "Bills & funds", icon: CalendarDays },
  { key: "tax", title: "Tax", caption: "PIT & LIRS", icon: FileText },
  { key: "ajo", title: "Ajo", caption: "Cooperative groups", icon: Users },
  { key: "bank-charge", title: "Bank charges", caption: "Fee auditor", icon: ShieldAlert },
];

export function ToolsScroller({
  onNavigate,
}: {
  onNavigate: (key: Tool["key"]) => void;
}) {
  return (
    <div>
      <div className="mb-3 px-1">
        <h3 className="text-[15px] font-semibold text-[var(--text-1)]">Tools</h3>
      </div>
      <div className="-mx-5 overflow-x-auto px-5 pb-2 [scrollbar-width:none]">
        <div className="flex gap-3">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.key}
                onClick={() => onNavigate(tool.key)}
                className="press shrink-0 rounded-[18px] border border-[var(--line)] bg-[var(--surface-2)] p-3 text-left"
                style={{ width: 128 }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[var(--text-2)]">
                  <Icon size={18} />
                </div>
                <p className="mt-2 truncate text-[13px] font-semibold text-[var(--text-1)]">
                  {tool.title}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-[var(--text-3)]">
                  {tool.caption}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}