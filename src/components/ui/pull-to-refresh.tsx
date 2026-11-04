"use client";

import { useState, useRef, ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

export function PullToRefresh({
  children,
  onRefresh,
  notificationText = "We're getting your balance, please hold on...",
}: {
  children: ReactNode;
  onRefresh: () => Promise<void> | void;
  notificationText?: string;
}) {
  const [pullY, setPullY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isAtTop = () => {
    return (window.scrollY || document.documentElement.scrollTop) <= 0;
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (isAtTop() && !isRefreshing) {
        startY.current = e.touches[0].clientY;
      } else {
        startY.current = null;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY.current === null || isRefreshing) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta > 0) {
        if (delta > 5) e.preventDefault();
        setPullY(Math.min(delta * 0.5, 90));
      }
    };

    const handleTouchEnd = async () => {
      if (startY.current === null) return;
      const shouldRefresh = pullY > 60 && !isRefreshing;
      startY.current = null;

      if (shouldRefresh) {
        setIsRefreshing(true);
        setPullY(0);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      } else {
        setPullY(0);
      }
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd);

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [pullY, isRefreshing, onRefresh]);

  return (
    <div ref={containerRef} className="relative">
      
      {/* FLOATING NOTIFICATION BAR */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ y: -100, opacity: 0, x: "-50%" }}
            animate={{ y: 16, opacity: 1, x: "-50%" }}
            exit={{ y: -100, opacity: 0, x: "-50%" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed top-0 left-1/2 z-[100] w-[90%] max-w-sm flex items-center justify-center gap-2 rounded-full border-2 px-4 py-2.5 shadow-2xl backdrop-blur-md"
            style={{ 
              backgroundColor: "#000000", 
              borderColor: "#DE3121",
              color: "#DE3121"
            }}
          >
            <Loader2 size={16} className="animate-spin" />
            <span className="text-[13px] font-bold tracking-wide">
              {notificationText}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content wrapper */}
      <div
        style={{
          transform: `translateY(${pullY}px)`,
          transition: pullY === 0 ? "transform 0.25s ease-out" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}