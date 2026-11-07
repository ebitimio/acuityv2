"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export type Cur = "NGN" | "USD";
export interface FmtOpts { decimals?: boolean; sign?: boolean; force?: boolean; }
export interface FormattedParts {
  prefix: string;
  symbol: string;
  value: string;
  raw: number;
}

interface Ctx {
  currency: Cur;
  setCurrency: (c: Cur) => void;
  rate: number;
  symbol: string;
  hidden: boolean;
  toggleHidden: () => void;
  convert: (ngn: number) => number;
  fmt: (ngn: number, o?: FmtOpts) => string;
  fmtParts: (ngn: number, o?: FmtOpts) => FormattedParts;
}

const C = createContext<Ctx | null>(null);
const FALLBACK_RATE = 1500;

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCur] = useState<Cur>("NGN");
  const [rate, setRate] = useState(FALLBACK_RATE);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    try {
      const c = localStorage.getItem("acuity:currency");
      if (c === "USD" || c === "NGN") setCur(c);
      const r = Number(localStorage.getItem("acuity:rate"));
      if (r > 0) setRate(r);
      setHidden(localStorage.getItem("acuity:hidden") === "1");
    } catch {}
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((r) => r.json())
      .then((d) => {
        const n = d?.rates?.NGN;
        if (n > 0) {
          setRate(n);
          try { localStorage.setItem("acuity:rate", String(n)); } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const setCurrency = useCallback((c: Cur) => {
    setCur(c);
    try { localStorage.setItem("acuity:currency", c); } catch {}
  }, []);

  const toggleHidden = useCallback(() => {
    setHidden((h) => {
      const next = !h;
      try { localStorage.setItem("acuity:hidden", next ? "1" : "0"); } catch {}
      return next;
    });
  }, []);

  const value = useMemo<Ctx>(() => {
    const symbol = currency === "USD" ? "$" : "₦";
    const convert = (n: number) => (currency === "USD" ? n / rate : n);
    
    const fmtParts = (n: number, o?: FmtOpts): FormattedParts => {
      const v = convert(n);
      if (hidden && !o?.force) return { prefix: "", symbol, value: "••••", raw: v };
      const d = o?.decimals ?? currency === "USD";
      const s = new Intl.NumberFormat("en-NG", {
        minimumFractionDigits: d ? 2 : 0,
        maximumFractionDigits: d ? 2 : 0,
      }).format(Math.abs(v));
      
      const isNegative = v < 0;
      let prefix = "";
      if (isNegative) prefix = "-";
      else if (o?.sign && v > 0) prefix = "+";
      
      return { prefix, symbol, value: s, raw: v };
    };

    const fmt = (n: number, o?: FmtOpts) => {
      const { prefix, symbol: sym, value: formatted } = fmtParts(n, o);
      return `${prefix}${sym}${formatted}`;
    };
    
    return { currency, setCurrency, rate, symbol, hidden, toggleHidden, convert, fmt, fmtParts };
  }, [currency, rate, hidden, setCurrency, toggleHidden]);

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useCurrency() {
  const v = useContext(C);
  if (!v) throw new Error("useCurrency must be used inside CurrencyProvider");
  return v;
}

/**
 * Renders currency values with calibrated optical scaling for the Naira sign
 * so it never overpowers the numbers or looks bigger than the dollar sign.
 */
export function MoneyText({
  value,
  className,
  symbolClassName,
  decimals,
  sign,
  force,
}: {
  value: number;
  className?: string;
  symbolClassName?: string;
  decimals?: boolean;
  sign?: boolean;
  force?: boolean;
}) {
  const { fmtParts, currency } = useCurrency();
  const { prefix, symbol, value: formatted } = fmtParts(value, { decimals, sign, force });

  return (
    <span className={cn("inline-flex items-baseline tabular font-hero", className)}>
      {prefix && <span className="mr-0.5">{prefix}</span>}
      <span
        className={cn(
          "font-sans select-none inline-block",
          currency === "NGN" ? "text-[0.76em] font-bold" : "text-[0.9em]",
          symbolClassName
        )}
      >
        {symbol}
      </span>
      <span>{formatted}</span>
    </span>
  );
}