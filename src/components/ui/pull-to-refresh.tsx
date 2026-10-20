"use client";

import { useState, useRef, ReactNode, useEffect } from "react";
import { RefreshCw } from "lucide-react";

export function PullToRefresh({
  children,
  onRefresh,
}: {
  children: ReactNode;
  onRefresh: () => Promise<void> | void;
}) {
  const [pullY, setPullY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Allow pull-to-refresh only when the page is scrolled to the top
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
        // Only prevent scroll when the pull is meaningful
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
        setPullY(50);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullY(0);
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
      {/* Spinner that appears as you pull */}
      <div
        className="absolute inset-x-0 top-0 z-50 flex justify-center transition-opacity duration-200"
        style={{
          height: pullY,
          opacity: pullY > 10 ? 1 : 0,
          paddingTop: 16,
        }}
      >
        <div className="bg-[var(--surface-3)] p-2 rounded-full shadow-lg">
          <RefreshCw
            size={20}
            className={isRefreshing ? "animate-spin" : ""}
            style={{
              transform: `rotate(${pullY * 4}deg)`,
              transition: isRefreshing ? undefined : "transform 0.05s",
            }}
          />
        </div>
      </div>

      {/* Content wrapper — translated down as you pull */}
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