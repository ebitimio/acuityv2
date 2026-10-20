"use client";

import { Check, ChevronRight } from "lucide-react";
import type { SetupStatus } from "@/lib/supabase/database";

interface Props {
  status: SetupStatus;
  onStartStep: (step: "account" | "income" | "bills") => void;
  onDismiss: () => void;
}

const STEPS = [
  { key: "account" as const, label: "Add an account", desc: "Start with a bank or wallet", field: "has_account" as const },
  { key: "income" as const, label: "Add income", desc: "Salary, freelance, or allowance", field: "has_income" as const },
  { key: "bills" as const, label: "Add bills", desc: "Rent, data, subscriptions", field: "has_bills" as const },
];

export function SetupChecklist({ status, onStartStep, onDismiss }: Props) {
  const doneCount = STEPS.filter((s) => status[s.field]).length;
  const total = STEPS.length;

  return (
    <div className="rounded-3xl bg-[var(--surface-2)] border border-[var(--line)] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[11px] text-[var(--text-3)] mb-0.5">Get started</p>
          <p className="text-[16px] font-semibold">
            {doneCount} of {total} steps done
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-[12px] text-[var(--text-3)] hover:text-[var(--text-1)]"
        >
          Skip setup
        </button>
      </div>

      <div className="h-1.5 bg-[var(--fill-2)] rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-[var(--brand)] transition-all"
          style={{ width: `${(doneCount / total) * 100}%` }}
        />
      </div>

      <div className="space-y-1">
        {STEPS.map((step) => {
          const done = status[step.field];
          return (
            <button
              key={step.key}
              onClick={() => !done && onStartStep(step.key)}
              disabled={done}
              className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-xl text-left transition-colors ${
                done ? "opacity-50" : "hover:bg-[var(--fill-1)]"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  done ? "bg-[var(--gain)] text-[var(--text-1)]" : "bg-[var(--fill-2)] text-[var(--text-3)]"
                }`}
              >
                {done ? <Check size={14} strokeWidth={3} /> : null}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium">{step.label}</p>
                <p className="text-[11px] text-[var(--text-3)] truncate">{step.desc}</p>
              </div>
              {!done && <ChevronRight size={16} className="text-[var(--text-3)] shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}