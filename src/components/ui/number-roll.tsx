"use client";

import { useEffect, useState } from "react";
import { animate, useMotionValue, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NumberRollProps {
  value: number;
  currency?: string;
  className?: string;
  duration?: number;
  showDecimals?: boolean;
}

export function NumberRoll({
  value,
  currency = "₦",
  className,
  duration = 0.8,
  showDecimals = true, 
}: NumberRollProps) {
  const count = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    const formatter = new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    });

    const controls = animate(count, value, {
      duration: duration,
      ease: [0.2, 0.8, 0.2, 1],
      onUpdate: (latest) => {
        setDisplayValue(formatter.format(latest));
      },
    });

    return controls.stop;
  }, [value, duration, showDecimals, count]);

  const [main, decimals] = displayValue.split(".");

  return (
    <span className={cn("inline-flex items-baseline tabular", className)}>
      <span className="mr-1 text-[0.7em] opacity-80 relative -top-[0.05em]">
        {currency}
      </span>
      <motion.span>{main}</motion.span>
      {showDecimals && decimals && (
        <span className="text-[0.5em] opacity-70 ml-0.5">.{decimals}</span>
      )}
    </span>
  );
}