"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";

// 22 Handcrafted Financial Intelligence & Acuity Doodles
const DOODLE_ICONS = [
  // 1. Naira Currency Coin
  (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 7v10M16 7v10M8 7l8 10M6 10.5h12M6 13.5h12" />
    </svg>
  ),
  // 2. Piggy Bank
  (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <path d="M19 11c0-3.9-3.1-7-7-7-1.4 0-2.8.4-4 1.2L6 4v3.2C4.8 8.4 4 10.1 4 12c0 3.9 3.1 7 7 7h1v2h3v-2h1c2.2 0 4-1.8 4-4v-1h2v-3h-2z" />
      <path d="M11 4v3M9 10h.01M16 11h.01" />
    </svg>
  ),
  // 3. Growth Trend
  (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  ),
  // 4. Bank Card
  (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <rect x="2" y="5" width="20" height="14" rx="2.5" />
      <line x1="2" y1="10" x2="22" y2="10" />
      <rect x="5" y="14" width="3.5" height="2" rx="0.5" />
    </svg>
  ),
  // 5. Vault Safe
  (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 10v4M10 12h4M6 8h.01M6 16h.01M18 8h.01M18 16h.01" />
    </svg>
  ),
  // 6. Classical Bank Building
  (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <path d="M3 21h18M3 10h18M12 3l9 4H3l9-4zM5 10v8M9 10v8M15 10v8M19 10v8" />
    </svg>
  ),
  // 7. Security Shield
  (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  // 8. Acuity Mascot Cap
  (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <path d="M4 15c0-4.4 3.6-8 8-8s8 3.6 8 8" />
      <path d="M2 15h20l-3 2H5l-3-2z" />
      <circle cx="12" cy="7" r="1.2" fill="currentColor" />
    </svg>
  ),
  // 9. Instant Zap
  (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  // 10. Leather Wallet
  (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <path d="M20 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
      <path d="M16 13h4M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  // 11. AI Sparkles
  (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />
    </svg>
  ),
  // 12. Target Runway
  (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  // 13. Balance Scale
  (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <path d="M12 3v18M6 8h12M6 8l-3 7h6l-3-7zM18 8l-3 7h6l-3-7zM9 21h6" />
    </svg>
  ),
  // 14. Intelligence Lightbulb
  (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-7 7c0 2.6 1.4 4.8 3.5 6h7c2.1-1.2 3.5-3.4 3.5-6a7 7 0 0 0-7-7z" />
    </svg>
  ),
  // 15. Percent Badge
  (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <circle cx="9" cy="9" r="1.5" fill="currentColor" />
      <circle cx="15" cy="15" r="1.5" fill="currentColor" />
    </svg>
  ),
  // 16. Volume Bar Chart
  (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  ),
  // 17. Encryption Key
  (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="m11 12 8-8M15 4l4 4M18 7l2 2" />
    </svg>
  ),
  // 18. Diamond Asset
  (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
      <path d="M2 9h20M10 3l-2 6 4 12 4-12-2-6" />
    </svg>
  ),
  // 19. Itemized Receipt
  (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z" />
      <line x1="8" y1="8" x2="16" y2="8" />
      <line x1="8" y1="12" x2="14" y2="12" />
      <line x1="8" y1="16" x2="16" y2="16" />
    </svg>
  ),
  // 20. Auto-Sync Arrows
  (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <path d="M7 10h14l-4-4M17 14H3l4 4" />
    </svg>
  ),
  // 21. Runway Hourglass
  (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <path d="M5 2h14M5 22h14M7 2v5l5 5-5 5v5M17 2v5l-5 5 5 5v5" />
    </svg>
  ),
  // 22. Acuity Monogram "A."
  (p: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M8 16l4-8 4 8M9.5 13h5" />
      <circle cx="17.5" cy="16" r="1.2" fill="currentColor" />
    </svg>
  ),
];

// Generates a dense, closely-fitted mosaic of scattered financial doodles
function generateDoodleGrid() {
  const doodles = [];
  const COLS = 7;
  const ROWS = 11;
  const ROTATIONS = [-14, 12, -8, 16, -10, 15, -6, 8, -12, 14, -5, 11];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const idx = (r * COLS + c) % DOODLE_ICONS.length;
      const rot = ROTATIONS[(r * 3 + c) % ROTATIONS.length];
      const delay = ((r + c) * 0.08) % 1.6;
      
      // Stagger rows for tight interlocking layout
      const xOffset = r % 2 === 0 ? 0 : 7;
      const xPercent = (c / (COLS - 1)) * 96 + 2 + (xOffset ? 2 : -2);
      const yPercent = (r / (ROWS - 1)) * 96 + 2;

      // Color cadence: 50% Company Orange (#DE3121), 30% Warm Amber/Peach (#FF7D54), 20% Subtle Charcoal
      const colorCategory = (r * 2 + c * 3) % 10;
      const type = colorCategory < 5 ? "orange" : colorCategory < 8 ? "warm" : "neutral";

      doodles.push({
        id: `${r}-${c}`,
        iconIdx: idx,
        x: xPercent,
        y: yPercent,
        rot,
        delay,
        type,
      });
    }
  }
  return doodles;
}

function useSafeTheme() {
  try {
    return useTheme();
  } catch {
    return null;
  }
}

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [mounted, setMounted] = useState(false);
  const themeCtx = useSafeTheme();
  const [isLightState, setIsLightState] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof document !== "undefined") {
      setIsLightState(document.documentElement.dataset.theme === "light");
    }
  }, []);

  const isLight = mounted ? (themeCtx?.resolved === "light" || isLightState) : false;

  const doodles = useMemo(() => generateDoodleGrid(), []);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      onComplete();
    }, 2400); // 2.4s splash for optimal loading perception

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden select-none transition-colors duration-300"
      style={{
        background: isLight ? "#f8f8fb" : "#0b0b0c",
      }}
    >
      {/* Dense Scattered Doodle Art Tapestry */}
      <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
        {doodles.map((d) => {
          const Icon = DOODLE_ICONS[d.iconIdx];

          // Dynamic Smart Theme Colors
          let strokeColor = "#DE3121"; // Signature Acuity Company Orange
          let opacity = 0.55;

          if (d.type === "orange") {
            strokeColor = "#DE3121"; // Fiery Company Orange
            opacity = isLight ? 0.72 : 0.65;
          } else if (d.type === "warm") {
            strokeColor = isLight ? "#E65100" : "#FF7A50"; // Deep Warm Orange
            opacity = isLight ? 0.65 : 0.55;
          } else {
            strokeColor = isLight ? "#94a3b8" : "#475569"; // Subtle Structural Neutral
            opacity = isLight ? 0.45 : 0.4;
          }

          return (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{
                opacity: [opacity * 0.8, opacity, opacity * 0.8],
                y: [0, -3, 0],
                rotate: [d.rot, d.rot + 2, d.rot],
              }}
              transition={{
                duration: 3.5 + (d.delay % 1.5),
                repeat: Infinity,
                ease: "easeInOut",
                delay: d.delay,
              }}
              className="absolute w-[22px] h-[22px] sm:w-[26px] sm:h-[26px]"
              style={{
                left: `${d.x}%`,
                top: `${d.y}%`,
                transform: `translate(-50%, -50%) rotate(${d.rot}deg)`,
                color: strokeColor,
              }}
            >
              <Icon className="w-full h-full" />
            </motion.div>
          );
        })}

        {/* Center Vignette Mask (Guarantees crisp typography without doodle clutter) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isLight
              ? "radial-gradient(circle at 50% 50%, rgba(248, 248, 251, 0.95) 0%, rgba(248, 248, 251, 0.82) 36%, rgba(248, 248, 251, 0.25) 75%, transparent 100%)"
              : "radial-gradient(circle at 50% 50%, rgba(11, 11, 12, 0.96) 0%, rgba(11, 11, 12, 0.82) 38%, rgba(11, 11, 12, 0.25) 75%, transparent 100%)",
          }}
        />

        {/* Ambient Company Orange Radial Aura */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[480px] h-[340px] sm:h-[480px] rounded-full blur-[90px] pointer-events-none"
          style={{
            background: isLight
              ? "radial-gradient(circle, rgba(222, 49, 33, 0.12) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(222, 49, 33, 0.22) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Centerpiece Hero Brand Typography & Loading State */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center text-center px-4"
      >
        {/* ACUITY. Wordmark */}
        <div className="flex items-baseline select-none">
          <span
            className="text-[58px] sm:text-[72px] font-black tracking-tighter drop-shadow-sm transition-colors duration-300"
            style={{
              color: isLight ? "#0f1115" : "#ffffff",
            }}
          >
            ACUITY
          </span>

          {/* Pulsing Company Orange Dot */}
          <motion.span
            animate={{
              opacity: [0.4, 1, 0.4],
              scale: [0.95, 1.08, 0.95],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="text-[58px] sm:text-[72px] font-black tracking-tighter drop-shadow-[0_0_12px_rgba(222,49,33,0.6)]"
            style={{ color: "#DE3121" }}
          >
            .
          </motion.span>
        </div>

        {/* Tagline Badge */}
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-1 text-[11px] sm:text-[12.5px] font-bold tracking-[0.26em] uppercase transition-colors duration-300"
          style={{
            color: isLight ? "rgba(15, 17, 21, 0.55)" : "rgba(245, 245, 246, 0.55)",
          }}
        >
          Financial Intelligence
        </motion.p>

        {/* Sleek Minimalist Loading Progress Line */}
        <div className="w-36 sm:w-44 h-1 rounded-full overflow-hidden bg-black/10 dark:bg-white/10 mt-5 p-0.5">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-1/2 h-full rounded-full shadow-[0_0_8px_#DE3121]"
            style={{ background: "#DE3121" }}
          />
        </div>
      </motion.div>
    </div>
  );
}
