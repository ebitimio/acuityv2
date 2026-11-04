"use client";

import { useState, useRef, ReactNode, useEffect } from "react";
import { Loader2 } from "lucide-react";

export function PullToRefresh({
  children,
  onRefresh,
  onRefreshStateChange,
  variant = "spinner",
}: {
  children: ReactNode;
  onRefresh: () => Promise<void> | void;
  onRefreshStateChange?: (isRefreshing: boolean) => void;
  variant?: "spinner" | "branded";
}) {
  const [pullY, setPullY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isAtTop = () => {
    return (window.scrollY || document.documentElement.scrollTop) <= 0;
  };

  useEffect(() => {
    onRefreshStateChange?.(isRefreshing);
  }, [isRefreshing, onRefreshStateChange]);

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
        setPullY(0); // Snap content back up immediately
        try {
          await onRefresh();
          if (variant === "branded") {
            await new Promise((resolve) => setTimeout(resolve, 600));
          }
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
  }, [pullY, isRefreshing, onRefresh, variant]);

  return (
    <div ref={containerRef} className="relative">
      
      {/* FLOATING SPINNER (Only for variant="spinner") */}
      {variant === "spinner" && (
        <div
          className="fixed inset-x-0 flex justify-center z-[100] pointer-events-none"
          style={{
            top: "calc(env(safe-area-inset-top) + 24px)", // Fixed slightly below the status bar
            opacity: pullY > 10 || isRefreshing ? 1 : 0, // Fade in based on pull distance
            transition: "opacity 0.2s ease-out", // Smooth fade
          }}
        >
          <div className="bg-[var(--surface-3)] p-2.5 rounded-full shadow-lg border border-white/5">
            <Loader2
              size={20}
              className={isRefreshing ? "animate-spin text-[var(--brand)]" : "text-[var(--text-2)]"}
            />
          </div>
        </div>
      )}

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