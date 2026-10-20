"use client";

import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { spring } from "@/lib/motion";

const stack: string[] = [];
let locks = 0;

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const id = useId();
  const controls = useDragControls();
  const closeRef = useRef(onClose);
  const [mounted, setMounted] = useState(false);
  const [vv, setVv] = useState<{ height: number; offsetTop: number } | null>(null);

  useEffect(() => { closeRef.current = onClose; });
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    stack.push(id);
    if (locks++ === 0) document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && stack[stack.length - 1] === id) closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      stack.splice(stack.indexOf(id), 1);
      if (--locks === 0) document.body.style.overflow = "";
    };
  }, [open, id]);

  useEffect(() => {
    const v = window.visualViewport;
    if (!v) return;
    const update = () => setVv({ height: v.height, offsetTop: v.offsetTop });
    update();
    v.addEventListener("resize", update);
    v.addEventListener("scroll", update);
    return () => {
      v.removeEventListener("resize", update);
      v.removeEventListener("scroll", update);
    };
  }, []);

  if (!mounted) return null;

  const frame: React.CSSProperties = vv
    ? { position: "fixed", top: vv.offsetTop, left: 0, right: 0, height: vv.height }
    : { position: "fixed", inset: 0 };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          key={id}
          className="z-[200] flex items-end justify-center sm:items-center sm:p-6"
          style={frame}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: "var(--scrim)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="glass glass-thick relative flex max-h-full w-full max-w-md flex-col overflow-hidden"
            style={{ borderRadius: "var(--r-sheet) var(--r-sheet) 0 0" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={spring.sheet}
            drag="y"
            dragControls={controls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 700) onClose();
            }}
          >
            <div
              className="px-5 pb-2 pt-3"
              style={{ touchAction: "none" }}
              onPointerDown={(e) => controls.start(e)}
            >
              <div
                className="mx-auto mb-3 h-1.5 w-10 rounded-full"
                style={{ background: "var(--fill-3)" }}
              />
              <div className="flex items-center justify-between">
                <h2 className="text-[18px] font-bold text-[var(--text-1)]">{title}</h2>
                <button
                  aria-label="Close"
                  onClick={onClose}
                  className="press flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-2)]"
                  style={{ background: "var(--fill-1)" }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-2">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}