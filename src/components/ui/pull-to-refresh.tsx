"use client";

import { useState, useRef, ReactNode, useEffect } from "react";

export function PullToRefresh({
  children,
  onRefresh,
  onRefreshStateChange,
}: {
  children: ReactNode;
  onRefresh: () => Promise<void> | void;
  onRefreshStateChange?: (isRefreshing: boolean) => void;
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