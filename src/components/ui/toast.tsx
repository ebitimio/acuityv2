"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check } from "lucide-react";

type Kind = "ok" | "err";
interface Item { id: number; msg: string; kind: Kind }

// Return the function directly so `const toast = useToast()` works
const Ctx = createContext<(msg: string, kind?: Kind) => void>(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);

  const toast = useCallback((msg: string, kind: Kind = "ok") => {
    const id = Date.now() + Math.random();
    setItems((p) => [...p, { id, msg, kind }]);
    setTimeout(() => setItems((p) => p.filter((t) => t.id !== id)), 3000);
  }, []);

  return (
    <Ctx.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed left-0 right-0 z-[400] flex flex-col items-center gap-2 px-4" style={{ top: "calc(max(env(safe-area-inset-top), 0px) + 12px)" }} aria-live="polite">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: -14, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -14 }} className="flex max-w-sm items-center gap-2 rounded-full border border-[var(--line-strong)] bg-[var(--surface-3)] px-4 py-2.5 text-[14px] font-semibold shadow-2xl">
              {t.kind === "ok" ? <Check size={16} className="shrink-0 text-[var(--gain)]" /> : <AlertCircle size={16} className="shrink-0 text-[var(--danger)]" />}
              <span>{t.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}