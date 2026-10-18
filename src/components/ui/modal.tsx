"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
          <motion.div onClick={(e) => e.stopPropagation()} initial={{ y: 48, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 48, opacity: 0 }} transition={{ type: "spring", stiffness: 420, damping: 34 }} className="max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-t-[32px] border border-[var(--line-strong)] bg-[var(--surface-2)] p-5 pb-[calc(20px+env(safe-area-inset-bottom))] sm:rounded-[32px]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[19px] font-bold">{title}</h2>
              <button aria-label="Close" onClick={onClose} className="press flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.08] text-[var(--text-2)] hover:text-white"><X size={18} /></button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}