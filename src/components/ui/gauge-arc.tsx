"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";

interface GaugeArcProps {
  percentage: number; // 0 to 100
}

export function GaugeArc({ percentage }: GaugeArcProps) {
  const [displayValue, setDisplayValue] = useState(0);
  
  // The total length of the semi-circle path
  const pathLength = 251.2; // approx (Math.PI * 80) for r=80

  useEffect(() => {
    const controls = animate(0, percentage, {
      duration: 1.5,
      ease: [0.2, 0.8, 0.2, 1], // ease.emphasized
      onUpdate: (latest) => setDisplayValue(Math.round(latest)),
    });
    return controls.stop;
  }, [percentage]);

  // Calculate the stroke offset (0% = full stroke visible, 100% = no stroke visible)
  const strokeDashoffset = pathLength - (pathLength * displayValue) / 100;

  return (
    <div className="relative w-[200px] h-[100px] flex items-end justify-center overflow-hidden">
      {/* SVG Gauge */}
      <svg viewBox="0 0 200 100" className="w-full h-full absolute inset-0">
        {/* Background Track */}
        <path
          d="M 20 90 A 80 80 0 0 1 180 90"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="16"
          strokeLinecap="round"
        />
        
        {/* Animated Fill */}
        <motion.path
          d="M 20 90 A 80 80 0 0 1 180 90"
          fill="none"
          stroke="var(--brand)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={pathLength}
          strokeDashoffset={strokeDashoffset}
          style={{
            filter: "drop-shadow(0 0 8px var(--brand))", // Glowing arc tip
          }}
        />
      </svg>

      {/* Center Text */}
      <div className="relative z-10 flex flex-col items-center mb-2">
        <span className="text-[24px] font-bold text-white tabular">{displayValue}%</span>
        <span className="text-[12px] text-white/50">used</span>
      </div>
    </div>
  );
}