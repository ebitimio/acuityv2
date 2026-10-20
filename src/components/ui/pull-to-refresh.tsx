"use client";

import { useState, ReactNode } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { RefreshCw } from "lucide-react";

export function PullToRefresh({ children, onRefresh }: { children: ReactNode; onRefresh: () => Promise<void> | void }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const y = useMotionValue(0);
  const rotate = useTransform(y, [0, 80], [0, 360]);
  const opacity = useTransform(y, [0, 60], [0, 1]);

  const handleDragEnd = async () => {
    if (y.get() > 70 && !isRefreshing) {
      setIsRefreshing(true);
      y.set(50);
      try {
        await onRefresh();
      } catch (e) {
        console.error("Refresh failed", e);
      } finally {
        setIsRefreshing(false);
        y.set(0);
      }
    } else {
      y.set(0);
    }
  };

  return (
    <div className="relative min-h-[100dvh] overflow-hidden">
      <motion.div
        style={{ opacity, y }}
        className="absolute inset-x-0 top-0 z-50 flex justify-center pt-6 pointer-events-none"
      >
        <motion.div style={{ rotate }} className="bg-[var(--surface-3)] p-2 rounded-full shadow-lg">
          <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} />
        </motion.div>
      </motion.div>

      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.5, bottom: 0 }}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className="min-h-[100dvh]"
      >
        {children}
      </motion.div>
    </div>
  );
}