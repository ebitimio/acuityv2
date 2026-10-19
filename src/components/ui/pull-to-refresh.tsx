"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { spring } from "@/lib/motion";

export function PullToRefresh({ onRefresh, children }: { onRefresh: () => Promise<void>; children: ReactNode }) {
  const y = useMotionValue(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY > 0) return;
    startY.current = e.touches[0].clientY;
    pulling.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!pulling.current || refreshing) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      // Resistance: pulls slower the further you go
      y.set(Math.min(delta * 0.55, 100));
    }
  };

  const handleTouchEnd = async () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (y.get() > 60 && !refreshing) {
      setRefreshing(true);
      animate(y, 60, spring.snappy);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        animate(y, 0, spring.snappy);
      }
    } else {
      animate(y, 0, spring.snappy);
    }
  };

  return (
    <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} className="relative flex-1 flex flex-col">
      <motion.div
        style={{ y }}
        className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 z-[5] flex items-center justify-center"
      >
        {y.get() > 20 && (
          <RefreshCw
            size={20}
            className={`text-[var(--brand)] transition-transform ${refreshing ? "animate-spin" : ""}`}
            style={{ transform: refreshing ? undefined : `rotate(${y.get() * 3}deg)` }}
          />
        )}
      </motion.div>
      <motion.div style={{ y }} className="flex-1 flex flex-col">
        {children}
      </motion.div>
    </div>
  );
}