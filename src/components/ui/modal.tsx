"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const [vv, setVv] = useState<{ height: number; offsetTop: number } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;
    const update = () => {
      const v = window.visualViewport!;
      setVv({ height: v.height, offsetTop: v.offsetTop });
    };
    update();
    window.visualViewport.addEventListener("resize", update);
    window.visualViewport.addEventListener("scroll", update);
    return () => {
      window.visualViewport?.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("scroll", update);
    };
  }, []);

  // iOS: pin the overlay to the *visible* region so the sheet sits at the bottom of the keyboard
  const overlayStyle: React.CSSProperties = vv
    ? {
        top: vv.offsetTop,
        left: 0,
        right: 0,
        height: vv.height,
        position: "fixed",
      }
    : { position: "fixed", inset: 0 };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="z-[200] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          style={overlayStyle}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 48, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="max-h-full w-full max-w-md overflow-y-auto rounded-t-[32px] border border-[var(--line-strong)] bg-[var(--surface-2)] p-5 pb-[calc(20px+env(safe-area-inset-bottom))] sm:max-h-[88dvh] sm:rounded-[32px]"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[19px] font-bold">{title}</h2>
              <button
                aria-label="Close"
                onClick={onClose}
                className="press flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.08] text-[var(--text-2)] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}