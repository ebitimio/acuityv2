"use client";

import { useState, useMemo } from "react";
import { BRANDS, findBrand } from "@/lib/brands";
import { BrandLogo } from "./brand-logo";
import { Search, Check, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BankPickerProps {
  value: string;
  onChange: (bankName: string) => void;
  className?: string;
  autoFocus?: boolean;
}

export function BankPicker({
  value,
  onChange,
  className,
  autoFocus = false,
}: BankPickerProps) {
  const [query, setQuery] = useState("");
  const [isOther, setIsOther] = useState(false);
  const selectedBrand = useMemo(() => findBrand(value, "bank"), [value]);

  const bankBrands = useMemo(() => {
    const list = BRANDS.filter((b) => b.kind === "bank");
    if (!query.trim()) return list;
    const q = query.toLowerCase().trim();
    return list.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.aliases.some((a) => a.toLowerCase().includes(q))
    );
  }, [query]);

  // If a bank is selected and not in custom "other" mode:
  if (value && !isOther && selectedBrand) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-[var(--line-strong)] bg-[var(--surface-1)] p-3 flex items-center justify-between gap-3 shadow-xs",
          className
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <BrandLogo name={selectedBrand.name} kind="bank" size={36} />
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-[var(--text-1)] truncate">
              {selectedBrand.name}
            </p>
            <p className="text-[11.5px] text-[var(--gain)] flex items-center gap-1 font-medium">
              <Check size={12} strokeWidth={2.5} /> Bank identified
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            onChange("");
            setQuery("");
          }}
          className="text-[12px] font-bold text-[var(--brand)] px-3 py-1.5 rounded-full hover:bg-[var(--fill-1)] active:scale-95 transition-all"
        >
          Change
        </button>
      </div>
    );
  }

  // If "Other" text fallback is active:
  if (isOther) {
    return (
      <div className={cn("space-y-1.5", className)}>
        <div className="relative flex items-center">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your bank or institution..."
            className="w-full h-12 px-4 pr-16 rounded-xl bg-[var(--surface-1)] border border-[var(--line-strong)] text-[14px] text-white placeholder:text-[var(--text-3)] outline-none focus:border-[var(--brand)] transition-colors"
            autoFocus
          />
          <button
            type="button"
            onClick={() => {
              setIsOther(false);
              onChange("");
            }}
            className="absolute right-3 text-[12px] font-semibold text-[var(--text-3)] hover:text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative flex items-center">
        <Search
          size={15}
          className="absolute left-3.5 text-[var(--text-3)] pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search bank (e.g. GTBank, Kuda, OPay, Zenith)..."
          className="w-full h-11 pl-9 pr-8 rounded-xl bg-[var(--surface-1)] border border-[var(--line-strong)] text-[13.5px] text-white placeholder:text-[var(--text-3)] outline-none focus:border-[var(--brand)] transition-colors"
          autoFocus={autoFocus}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 text-[var(--text-3)] hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="max-h-48 overflow-y-auto rounded-xl border border-[var(--line)] bg-[var(--surface-2)] divide-y divide-[var(--line)]">
        {bankBrands.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => {
              onChange(b.name);
              setQuery("");
            }}
            className="w-full flex items-center justify-between p-2.5 px-3 hover:bg-[var(--fill-1)] active:bg-[var(--fill-2)] transition-colors text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <BrandLogo name={b.name} kind="bank" size={26} />
              <span className="text-[13.5px] font-medium text-[var(--text-1)] truncate">
                {b.name}
              </span>
            </div>
            <ChevronRight size={14} className="text-[var(--text-3)] shrink-0" />
          </button>
        ))}

        <button
          type="button"
          onClick={() => {
            setIsOther(true);
            onChange("");
          }}
          className="w-full flex items-center justify-between p-2.5 px-3 hover:bg-[var(--fill-1)] active:bg-[var(--fill-2)] transition-colors text-left text-[var(--text-2)]"
        >
          <span className="text-[13px] font-medium">
            + Other Institution (Type manually)
          </span>
          <ChevronRight size={14} className="text-[var(--text-3)]" />
        </button>
      </div>
    </div>
  );
}
