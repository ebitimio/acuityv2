"use client";

import { Calendar, Check } from "lucide-react";
import { cn } from "@/lib/utils";

function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

interface DayPickerProps {
  value: number;
  onChange: (day: number) => void;
  maxDays?: number; // 28, 30, or 31
  label?: string;
  className?: string;
  showPresets?: boolean;
}

export function DayPicker({
  value,
  onChange,
  maxDays = 31,
  label,
  className,
  showPresets = true,
}: DayPickerProps) {
  const days = Array.from({ length: maxDays }, (_, i) => i + 1);

  const presets = [
    { label: "1st", day: 1 },
    { label: "15th", day: 15 },
    { label: "25th", day: 25 },
    { label: "27th", day: 27 },
    { label: `${maxDays}th (End)`, day: maxDays },
  ].filter((p) => p.day <= maxDays);

  return (
    <div className={cn("w-full select-none", className)}>
      {label && (
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[12.5px] font-semibold text-white/70">{label}</span>
          <span className="text-[12px] font-bold text-[var(--brand)]">
            {value ? `${getOrdinal(value)} of month` : "Choose day"}
          </span>
        </div>
      )}

      {/* Quick presets */}
      {showPresets && (
        <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {presets.map((p) => (
            <button
              key={p.day}
              type="button"
              onClick={() => onChange(p.day)}
              className={cn(
                "px-2.5 py-1 rounded-full text-[12px] font-semibold shrink-0 transition-all",
                value === p.day
                  ? "bg-[var(--brand)] text-[var(--brand-ink)] shadow-sm"
                  : "bg-white/[0.07] text-white/70 hover:bg-white/[0.12] hover:text-white"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* 7-column calendar grid */}
      <div className="grid grid-cols-7 gap-1.5 p-2 rounded-2xl bg-white/[0.04] border border-white/10">
        {days.map((d) => {
          const isSelected = value === d;
          return (
            <button
              key={d}
              type="button"
              onClick={() => onChange(d)}
              className={cn(
                "h-10 rounded-xl flex items-center justify-center text-[14px] font-bold transition-all active:scale-95 relative",
                isSelected
                  ? "bg-[var(--brand)] text-[var(--brand-ink)] font-black shadow-md scale-105 z-10"
                  : "bg-white/[0.04] text-white/80 hover:bg-white/[0.1] hover:text-white"
              )}
            >
              <span>{d}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[12px] text-white/50">
        <Calendar size={13} className="text-[var(--brand)]" />
        <span>Recurs automatically on the {getOrdinal(value || 1)} of every month</span>
      </div>
    </div>
  );
}
