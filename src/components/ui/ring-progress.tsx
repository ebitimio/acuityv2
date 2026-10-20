"use client";

import { motion } from "framer-motion";

interface Props {
  percentage: number;
  tone?: string;
  size?: number;
  stroke?: number;
  label?: string;
}

export function RingProgress({
  percentage,
  tone = "var(--brand)",
  size = 44,
  stroke = 4,
  label,
}: Props) {
  const clamped = Math.max(0, Math.min(percentage, 100));
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (circumference * clamped) / 100;

  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--fill-2)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: "spring", stiffness: 90, damping: 18 }}
        />
      </svg>
      {label !== undefined ? (
        <span className="absolute text-[10px] font-semibold text-[var(--text-1)]">
          {label}
        </span>
      ) : (
        <span className="absolute text-[10px] font-semibold text-[var(--text-1)]">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}