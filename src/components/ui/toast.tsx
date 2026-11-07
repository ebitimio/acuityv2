"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check } from "lucide-react";

type Kind = "ok" | "err";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  kind?: Kind;
  duration?: number;
  action?: ToastAction;
}

interface Item {
  id: number;
  msg: string;
  kind: Kind;
  action?: ToastAction;
}

type ToastFn = (msg: string, kindOrOptions?: Kind | ToastOptions) => void;

const Ctx = createContext<ToastFn>(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);

  const toast = useCallback((msg: string, kindOrOptions: Kind | ToastOptions = "ok") => {
    const id = Date.now() + Math.random();
    const options: ToastOptions =
      typeof kindOrOptions === "string"
        ? { kind: kindOrOptions }
        : kindOrOptions || {};

    const kind = options.kind || "ok";
    const duration = options.duration ?? (options.action ? 4500 : 3000);

    setItems((p) => [...p, { id, msg, kind, action: options.action }]);
    setTimeout(() => setItems((p) => p.filter((t) => t.id !== id)), duration);
  }, []);

  return (
    <Ctx.Provider value={toast}>
      {children}
      <div
        className="pointer-events-none fixed left-0 right-0 z-[100000] flex flex-col items-center gap-2 px-4"
        style={{ top: "calc(max(env(safe-area-inset-top), 0px) + 12px)" }}
        aria-live="polite"
      >
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14 }}
              className="glass glass-thick flex max-w-sm items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold text-[var(--text-1)] shadow-xl"
            >
              {t.kind === "ok" ? (
                <Check size={14} className="shrink-0 text-[var(--gain)]" />
              ) : (
                <AlertCircle size={14} className="shrink-0 text-[var(--danger)]" />
              )}
              <span className="truncate">{t.msg}</span>
              {t.action && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    t.action?.onClick();
                    setItems((p) => p.filter((x) => x.id !== t.id));
                  }}
                  className="pointer-events-auto ml-2 rounded-full bg-[var(--brand)] px-2.5 py-0.5 text-[11.5px] font-bold text-[var(--brand-ink)] hover:opacity-90 active:scale-95 transition-transform shrink-0"
                >
                  {t.action.label}
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
