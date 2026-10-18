"use client";

import { useEffect, useState } from "react";
import { animate, useMotionValue, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NumberRollProps {
  value: number;
  currency?: string;
  className?: string;
  /** Duration in seconds (default 0.8s per spec) */
  duration?: number;
  /** Whether to show decimals (kobo/cents) */
  decimals?: boolean;
}

export function NumberRoll({
  value,
  currency = "₦",
  className,
  duration = 0.8,
  decimals = false,
}: NumberRollProps) {
  const count = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    // We create the formatter inside the effect so it's not a dependency
    const formatter = new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: decimals ? 2 : 0,
      maximumFractionDigits: decimals ? 2 : 0,
    });

    const controls = animate(count, value, {
      duration: duration,
      ease: [0.2, 0.8, 0.2, 1], // ease.emphasized from spec
      onUpdate: (latest) => {
        setDisplayValue(formatter.format(latest));
      },
    });

    return controls.stop;
  }, [value, duration, decimals, count]); 

  return (
    <span className={cn("inline-flex items-baseline tabular", className)}>
      {/* Currency symbol is scaled down and slightly raised per spec §2.2 */}
      <span className="mr-1 text-[0.7em] opacity-70 relative -top-[0.05em]">
        {currency}
      </span>
      <motion.span>{displayValue}</motion.span>
    </span>
  );
}