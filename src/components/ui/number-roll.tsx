"use client";

import { useEffect, useState } from "react";
import { animate, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/lib/currency";

interface NumberRollProps {
  value: number;
  className?: string;
  duration?: number;
  showDecimals?: boolean;
}

export function NumberRoll({ value, className, duration = 0.8, showDecimals = true }: NumberRollProps) {
  const { convert, symbol, hidden, currency } = useCurrency();
  const target = convert(value);
  const count = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(count, target, { duration, ease: [0.2, 0.8, 0.2, 1], onUpdate: setDisplay });
    return controls.stop;
  }, [target, duration, count]);

  const decimals = showDecimals || currency === "USD";
  const [main, dec] = new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  }).format(Math.abs(display)).split(".");

  return (
    <span className={cn("inline-flex items-baseline tabular", className)} aria-label={hidden ? "Balance hidden" : undefined}>
      {display < 0 && !hidden && <span className="mr-1">â</span>}
      <span className="mr-1 text-[0.6em] opacity-80">{symbol}</span>
      {hidden ? (
        <span>â¢â¢â¢â¢â¢â¢</span>
      ) : (
        <>
          <span>{main}</span>
          {decimals && dec && <span className="ml-0.5 text-[0.5em] opacity-70">.{dec}</span>}
        </>
      )}
    </span>
  );
}
