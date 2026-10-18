"use client";

import { animate } from "framer-motion";
import { useEffect, useState } from "react";

export function GaugeArc({ percentage, tone = "var(--brand)" }: { percentage: number; tone?: string }) {
  const [shown, setShown] = useState(0);
  const pathLength = 251.2;
  const capped = Math.max(0, Math.min(percentage, 100));

  useEffect(() => {
    const c = animate(0, capped, { duration: 1.2, ease: [0.2, 0.8, 0.2, 1], onUpdate: (v) => setShown(v) });
    return c.stop;
  }, [capped]);

  return (
    <div className="relative flex h-[110px] w-[210px] items-end justify-center overflow-hidden">
      <svg viewBox="0 0 200 100" className="absolute inset-0 h-full w-full" aria-hidden>
        <path d="M 20 90 A 80 80 0 0 1 180 90" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="14" strokeLinecap="round" />
        <path
          d="M 20 90 A 80 80 0 0 1 180 90"
          fill="none"
          stroke={tone}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={pathLength}
          strokeDashoffset={pathLength - (pathLength * shown) / 100}
        />
      </svg>
      <div className="relative mb-1 flex flex-col items-center">
        <span className="tabular text-[28px] font-extrabold leading-none">{Math.round(percentage)}%</span>
        <span className="mt-0.5 text-[12px] text-[var(--text-3)]">of budget used</span>
      </div>
    </div>
  );
}