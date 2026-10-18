"use client";

import { Loader2, type LucideIcon } from "lucide-react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Field({ label, icon: Icon, suffix, className, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label?: string; icon?: LucideIcon; suffix?: ReactNode }) {
  return (
    <label className={cn("block", className)}>
      {label && <span className="t-label mb-1.5 block px-1">{label}</span>}
      <span className="field">
        {Icon && <Icon size={18} className="shrink-0 text-[var(--text-3)]" />}
        <input {...rest} />
        {suffix}
      </span>
    </label>
  );
}

export function SelectField({ label, className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className={cn("block", className)}>
      {label && <span className="t-label mb-1.5 block px-1">{label}</span>}
      <span className="field">
        <select {...rest}>{children}</select>
      </span>
    </label>
  );
}

export function Button({ variant = "primary", loading, className, children, disabled, type, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "white" | "ghost" | "danger"; loading?: boolean }) {
  return (
    <button {...rest} type={type ?? "button"} disabled={disabled || loading} className={cn("btn press", `btn-${variant}`, className)}>
      {loading ? <Loader2 size={18} className="animate-spin" /> : children}
    </button>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", checked ? "bg-[var(--brand)]" : "bg-white/15")}>
      <span className={cn("absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all", checked ? "left-[22px]" : "left-0.5")} />
    </button>
  );
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="inline-flex rounded-full border border-[var(--line)] bg-[var(--surface-1)] p-1">
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)} className={cn("rounded-full px-3.5 py-1.5 text-[13px] font-bold transition-colors", value === o.value ? "bg-[var(--brand)] text-white" : "text-[var(--text-2)] hover:text-white")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}