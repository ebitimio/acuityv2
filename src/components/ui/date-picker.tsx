"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Modal } from "./modal";
import { cn } from "@/lib/utils";
import { parseLocalDate } from "@/lib/dates";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function DatePickerModal({
  open,
  onClose,
  value,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  value: string;
  onChange: (dateStr: string) => void;
}) {
  const validDate = parseLocalDate(value);

  const [viewYear, setViewYear] = useState(validDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(validDate.getMonth());

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const dateStr = `${viewYear}-${mm}-${dd}`;
    onChange(dateStr);
    onClose();
  };

  const handleSelectToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;
    setViewYear(yyyy);
    setViewMonth(today.getMonth());
    onChange(dateStr);
    onClose();
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const selectedYMD = value;

  return (
    <Modal open={open} onClose={onClose} title="Select Date">
      <div className="space-y-4">
        {/* Header navigation */}
        <div className="flex items-center justify-between px-1">
          <h4 className="text-[16px] font-bold text-white">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h4>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {DAY_NAMES.map((d) => (
            <span key={d} className="text-[11px] font-bold text-white/40 uppercase">
              {d}
            </span>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1.5 p-2 rounded-2xl bg-white/[0.04] border border-white/10">
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`blank-${i}`} className="h-9" />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const mm = String(viewMonth + 1).padStart(2, "0");
            const dd = String(day).padStart(2, "0");
            const thisYMD = `${viewYear}-${mm}-${dd}`;
            const isSelected = selectedYMD === thisYMD;

            return (
              <button
                key={day}
                type="button"
                onClick={() => handleSelectDay(day)}
                className={cn(
                  "h-9 rounded-xl flex items-center justify-center text-[13.5px] font-bold transition-all active:scale-95 relative",
                  isSelected
                    ? "bg-[var(--brand)] text-[var(--brand-ink)] font-black shadow-md scale-105 z-10"
                    : "bg-white/[0.04] text-white/80 hover:bg-white/[0.1] hover:text-white"
                )}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Quick actions */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={handleSelectToday}
            className="px-3 py-1.5 rounded-full text-[12.5px] font-bold text-[var(--brand)] bg-[var(--brand-soft)] hover:bg-[var(--brand)] hover:text-[var(--brand-ink)] transition-all"
          >
            Set to Today
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full text-[12.5px] font-bold text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}

interface DatePickerProps {
  value: string; // "YYYY-MM-DD"
  onChange: (dateStr: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function DatePickerField({
  value,
  onChange,
  label,
  placeholder = "Select date",
  className,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formattedDisplay = value
    ? new Date(value).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div className={cn("w-full", className)}>
      {label && <span className="t-label mb-1.5 block px-1">{label}</span>}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="field w-full text-left flex items-center justify-between cursor-pointer group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <CalendarIcon size={17} className="text-[var(--brand)] shrink-0" />
          <span className={cn("truncate text-[15px]", value ? "text-[var(--text-1)] font-semibold" : "text-[var(--text-3)]")}>
            {formattedDisplay || placeholder}
          </span>
        </div>
        <span className="text-[12px] font-bold text-[var(--brand)] px-2 py-0.5 rounded-full bg-[var(--brand-soft)]">
          Change
        </span>
      </button>

      <DatePickerModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
