"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type ThemeChoice = "system" | "light" | "dark";
type Resolved = "light" | "dark";
export type AccentColor = "red" | "lime" | "grey";

interface Ctx {
  theme: ThemeChoice;
  resolved: Resolved;
  accent: AccentColor;
  setTheme: (t: ThemeChoice) => void;
  setAccent: (a: AccentColor) => void;
}

const C = createContext<Ctx | null>(null);
const THEME_KEY = "acuity:theme";
const ACCENT_KEY = "acuity:accent";

function resolve(choice: ThemeChoice): Resolved {
  if (choice === "system") {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return choice;
}

// Defines the brand colors and the text color that sits ON TOP of the brand color
const ACCENT_COLORS: Record<AccentColor, { hex: string; soft: string; ink: string }> = {
  red: { hex: "#DE3121", soft: "rgba(222, 49, 33, 0.14)", ink: "#ffffff" },
  lime: { hex: "#D2F824", soft: "rgba(210, 248, 36, 0.14)", ink: "#000000" },
  grey: { hex: "#4B5563", soft: "rgba(75, 85, 99, 0.14)", ink: "#ffffff" },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeChoice>("system");
  const [resolved, setResolved] = useState<Resolved>("dark");
  const [accent, setAccentState] = useState<AccentColor>("red");

  // Apply color to CSS variables
  const applyAccent = useCallback((color: AccentColor) => {
    if (typeof document === "undefined") return;
    const { hex, soft, ink } = ACCENT_COLORS[color];
    document.documentElement.style.setProperty("--brand", hex);
    document.documentElement.style.setProperty("--brand-soft", soft);
    document.documentElement.style.setProperty("--brand-ink", ink);
  }, []);

  // Hydrate on mount
  useEffect(() => {
    let storedTheme: ThemeChoice | null = null;
    let storedAccent: AccentColor | null = null;
    
    try {
      const rawTheme = localStorage.getItem(THEME_KEY);
      if (rawTheme === "light" || rawTheme === "dark" || rawTheme === "system") storedTheme = rawTheme;
      
      const rawAccent = localStorage.getItem(ACCENT_KEY);
      if (rawAccent === "red" || rawAccent === "lime" || rawAccent === "grey") storedAccent = rawAccent;
    } catch {}

    const choice = storedTheme ?? "system";
    setThemeState(choice);
    const r = resolve(choice);
    setResolved(r);
    document.documentElement.dataset.theme = r;

    const ac = storedAccent ?? "red";
    setAccentState(ac);
    applyAccent(ac);
  }, [applyAccent]);

  // Follow system
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
    try { localStorage.setItem(THEME_KEY, t); } catch {}
    const r = resolve(t);
    setResolved(r);
    document.documentElement.dataset.theme = r;
  }, []);

  const setAccent = useCallback((a: AccentColor) => {
    setAccentState(a);
    try { localStorage.setItem(ACCENT_KEY, a); } catch {}
    applyAccent(a);
  }, [applyAccent]);

  return <C.Provider value={{ theme, resolved, accent, setTheme, setAccent }}>{children}</C.Provider>;
}

export function useTheme() {
  const v = useContext(C);
  if (!v) throw new Error("useTheme must be inside ThemeProvider");
  return v;
}