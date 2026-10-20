"use client";

import { useState, useEffect, type InputHTMLAttributes } from "react";
import { formatNumberInput, parseNumberInput } from "@/lib/format";
import { cn } from "@/lib/utils";

interface CurrencyFieldProps {
  label?: string;
  /** Numeric value (0 when empty) */
  value: number;
  /** Called on every keystroke with the parsed number */
  onChange: (value: number) => void;
  /** Optional placeholder */
  placeholder?: string;
  /** Optional prefix (â¦ by default) */
  prefix?: string;
  className?: string;
}

export function CurrencyField({
  label,
  value,
  onChange,
  placeholder = "0",
  prefix = "₦",
  className,
}: CurrencyFieldProps) {
  const [text, setText] = useState<string>(value ? formatNumberInput(String(value)) : "");

  // Keep the input in sync when value changes from outside
  useEffect(() => {
    const parsed = parseNumberInput(text);
    if (value !== parsed) {
      setText(value ? formatNumberInput(String(value)) : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (raw: string) => {
    const formatted = formatNumberInput(raw);
    setText(formatted);
    onChange(parseNumberInput(formatted));
  };

  return (
    <label className={cn("block", className)}>
      {label && <span className="t-label mb-1.5 block px-1">{label}</span>}
      <span className="field">
        <span className="text-[16px] text-[var(--text-3)]">{prefix}</span>
        <input
          type="text"
          inputMode="decimal"
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className="tabular"
        />
      </span>
    </label>
  );
}