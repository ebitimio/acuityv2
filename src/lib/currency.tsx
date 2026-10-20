"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Cur = "NGN" | "USD";
interface FmtOpts { decimals?: boolean; sign?: boolean; force?: boolean; }
interface Ctx {
  currency: Cur;
  setCurrency: (c: Cur) => void;
  rate: number;
  symbol: string;
  hidden: boolean;
  toggleHidden: () => void;
  convert: (ngn: number) => number;
  fmt: (ngn: number, o?: FmtOpts) => string;
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
      try { localStorage.setItem("acuity:hidden", h ? "0" : "1"); } catch {}
      return !h;
    });
  }, []);

  const value = useMemo<Ctx>(() => {
    const symbol = currency === "USD" ? "$" : "₦";
    const convert = (n: number) => (currency === "USD" ? n / rate : n);
    
    const fmt = (n: number, o?: FmtOpts) => {
      if (hidden && !o?.force) return "₦";
      const v = convert(n);
      const d = o?.decimals ?? currency === "USD";
      
      // 1. Determine if it's negative
      const isNegative = v < 0;
      
      // 2. Format the absolute value (without the sign)
      const s = new Intl.NumberFormat("en-NG", {
        minimumFractionDigits: d ? 2 : 0,
        maximumFractionDigits: d ? 2 : 0,
      }).format(Math.abs(v));
      
      // 3. Put the sign in front if needed
      let prefix = "";
      if (isNegative) prefix = "-";
      else if (o?.sign && v > 0) prefix = "+";
      
      return `${prefix}${symbol}${s}`;
    };
    
    return { currency, setCurrency, rate, symbol, hidden, toggleHidden, convert, fmt };
  }, [currency, rate, hidden, setCurrency, toggleHidden]);

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useCurrency() {
  const v = useContext(C);
  if (!v) throw new Error("useCurrency must be used inside CurrencyProvider");
  return v;
}