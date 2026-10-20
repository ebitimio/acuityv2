"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type ThemeChoice = "system" | "light" | "dark";
type Resolved = "light" | "dark";

interface Ctx {
  theme: ThemeChoice;
  resolved: Resolved;
  setTheme: (t: ThemeChoice) => void;
}

const C = createContext<Ctx | null>(null);
const KEY = "acuity:theme";

function resolve(choice: ThemeChoice): Resolved {
  if (choice === "system") {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return choice;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeChoice>("system");
  const [resolved, setResolved] = useState<Resolved>("dark");

  // Hydrate from localStorage on mount
  useEffect(() => {
    let stored: ThemeChoice | null = null;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw === "light" || raw === "dark" || raw === "system") stored = raw;
    } catch {}
    const choice = stored ?? "system";
    setThemeState(choice);
    const r = resolve(choice);
    setResolved(r);
    document.documentElement.dataset.theme = r;
  }, []);

  // Follow system when theme is "system"
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const r: Resolved = mq.matches ? "dark" : "light";
      setResolved(r);
      document.documentElement.dataset.theme = r;
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  const setTheme = useCallback((t: ThemeChoice) => {
    setThemeState(t);
    try { localStorage.setItem(KEY, t); } catch {}
    const r = resolve(t);
    setResolved(r);
    document.documentElement.dataset.theme = r;
  }, []);

  return <C.Provider value={{ theme, resolved, setTheme }}>{children}</C.Provider>;
}

export function useTheme() {
  const v = useContext(C);
  if (!v) throw new Error("useTheme must be inside ThemeProvider");
  return v;
}