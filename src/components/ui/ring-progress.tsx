"use client";

interface RingProgressProps {
  percentage: number;
  label?: string;
}

export function RingProgress({ percentage, label }: RingProgressProps) {
  // Ensure percentage is between 0 and 100
  const validPct = Math.max(0, Math.min(percentage, 100));
  
  const size = 44;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Calculate the offset based on the percentage
  const offset = circumference - (validPct / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(0, 0, 0, 0.15)" // Subtle black track
          strokeWidth={strokeWidth}
        />
        {/* Progress fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#000000" // Obsidian black progress
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      {/* Percentage text */}
      <span className="absolute text-[12px] font-bold text-black">
        {label ?? `${Math.round(validPct)}%`}
      </span>
    </div>
  );
}