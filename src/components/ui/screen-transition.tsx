"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ease } from "@/lib/motion";

export function ScreenTransition({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={id}
        className="flex flex-1 flex-col"
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.32, ease: ease.out } }}
        exit={{ opacity: 0, y: -8, scale: 0.992, transition: { duration: 0.16 } }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}