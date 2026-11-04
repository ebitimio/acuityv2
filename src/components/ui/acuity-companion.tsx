"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AcuityCompanionProps {
  isThinking?: boolean;
  hasInput?: boolean;
  size?: "large" | "compact" | "orb" | "mini";
  onTap?: () => void;
  className?: string;
}

/**
 * Living Acuity AI Companion & Mascot
 * Expressive white pill eyes with organic blinking, reading scan tracking,
 * lively micro-saccades, and warm Acuity Ember radiant aura.
 */
export function AcuityCompanion({
  isThinking = false,
  hasInput = false,
  size = "large",
  onTap,
  className,
}: AcuityCompanionProps) {
  const [blinkState, setBlinkState] = useState(false);
  const [gaze, setGaze] = useState({ x: 0, y: 0, rotate: 7, scaleY: 1, scaleX: 1 });
  const [isWinking, setIsWinking] = useState(false);

  // Natural organic blinking with single and double flutter blinks
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const triggerBlink = () => {
      // Lively natural blinking cadence: 1.8s - 3.8s
      const delay = Math.random() * 2000 + 1800;
      timeout = setTimeout(() => {
        setBlinkState(true);
        setTimeout(() => {
          setBlinkState(false);
          // 35% chance of a spontaneous double flutter-blink
          if (Math.random() < 0.35) {
            setTimeout(() => {
              setBlinkState(true);
              setTimeout(() => {
                setBlinkState(false);
                triggerBlink();
              }, 95);
            }, 75);
          } else {
            triggerBlink();
          }
        }, 115);
      }, delay);
    };

    triggerBlink();
    return () => clearTimeout(timeout);
  }, []);

  // Highly expressive eye movements: reading scan, thoughtful glances, lively micro-saccades
  useEffect(() => {
    if (isThinking) {
      // Thinking: Eyes glance up-left and up-right thoughtfully with soft squints
      let thinkStep = 0;
      const thinkInterval = setInterval(() => {
        thinkStep = (thinkStep + 1) % 4;
        const positions = [
          { x: -3, y: -4, rotate: -5, scaleY: 0.52, scaleX: 1.15 },
          { x: 3, y: -4, rotate: 6, scaleY: 0.48, scaleX: 1.18 },
          { x: 0, y: -5, rotate: 2, scaleY: 0.55, scaleX: 1.12 },
          { x: 2, y: -3, rotate: 8, scaleY: 0.5, scaleX: 1.15 },
        ];
        setGaze(positions[thinkStep]);
      }, 650);

      return () => clearInterval(thinkInterval);
    }

    if (hasInput) {
      // Typing: Eyes glance down and smoothly scan left-to-right as if reading your prompt!
      let readStep = 0;
      const scanInterval = setInterval(() => {
        readStep = (readStep + 1) % 3;
        const readPositions = [
          { x: -3, y: 4.5, rotate: 4, scaleY: 0.95, scaleX: 1.02 },
          { x: 0, y: 5.5, rotate: 6, scaleY: 0.92, scaleX: 1.04 },
          { x: 3, y: 4.5, rotate: 8, scaleY: 0.95, scaleX: 1.02 },
        ];
        setGaze(readPositions[readStep]);
      }, 750);

      return () => clearInterval(scanInterval);
    }

    // Idle: Lively sentient micro-saccades, curious head tilts, and organic glance shifts
    let saccadeTimeout: NodeJS.Timeout;
    const scheduleSaccade = () => {
      // Moves every 1.2s to 2.6s so the mascot feels genuinely alive
      const delay = Math.random() * 1400 + 1200;
      saccadeTimeout = setTimeout(() => {
        const gazePatterns = [
          { x: 0, y: 0, rotate: 7, scaleY: 1, scaleX: 1 }, // relaxed center
          { x: -5, y: -1, rotate: -3, scaleY: 1.04, scaleX: 0.96 }, // curious left
          { x: 5, y: -1, rotate: 10, scaleY: 1.04, scaleX: 0.96 }, // curious right
          { x: 0, y: -4, rotate: 4, scaleY: 1.12, scaleX: 0.94 }, // wide inquisitive up
          { x: -3, y: 3, rotate: 3, scaleY: 0.96, scaleX: 1.02 }, // glance down-left
          { x: 3, y: 2, rotate: 9, scaleY: 0.96, scaleX: 1.02 }, // glance down-right
          { x: 0, y: 0, rotate: 13, scaleY: 1.03, scaleX: 0.97 }, // cute head tilt
          { x: -4, y: 2, rotate: -2, scaleY: 1, scaleX: 1 }, // attentive look
        ];
        const nextGaze = gazePatterns[Math.floor(Math.random() * gazePatterns.length)];
        setGaze(nextGaze);
        scheduleSaccade();
      }, delay);
    };

    scheduleSaccade();
    return () => clearTimeout(saccadeTimeout);
  }, [isThinking, hasInput]);

  const handleTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWinking(true);
    setTimeout(() => setIsWinking(false), 320);
    onTap?.();
  };

  const isOrb = size === "orb";
  const isCompact = size === "compact";
  const isMini = size === "mini";

  return (
    <div
      onClick={handleTap}
      className={cn(
        "relative flex items-center justify-center cursor-pointer select-none transition-transform active:scale-95",
        isOrb
          ? "h-full w-full"
          : isMini
          ? "h-5 w-8"
          : isCompact
          ? "h-6 w-10"
          : "h-32 sm:h-36 w-full my-1",
        className
      )}
      title="Acuity Personal AI • Tap to say hi!"
    >
      {/* Radiant Brand Ember Aura (Breathing Glow) */}
      <motion.div
        animate={{
          scale: isThinking ? [1, 1.25, 1] : [1, 1.08, 1],
          opacity: isThinking ? [0.65, 0.95, 0.65] : isOrb || isMini ? [0.45, 0.75, 0.45] : isCompact ? [0.4, 0.65, 0.4] : [0.38, 0.58, 0.38],
        }}
        transition={{
          duration: isThinking ? 1.4 : 4.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={cn(
          "absolute rounded-full pointer-events-none",
          isOrb || isMini
            ? "w-10 h-10 blur-xs"
            : isCompact
            ? "w-12 h-12 blur-md"
            : "w-48 h-48 sm:w-56 sm:h-56 blur-2xl"
        )}
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--brand) 45%, transparent) 0%, color-mix(in srgb, var(--brand) 16%, transparent) 46%, transparent 72%)",
        }}
      />

      {/* Eyes Container with Lively Spring Motion */}
      <motion.div
        animate={{
          x: gaze.x,
          y: gaze.y,
          rotate: gaze.rotate,
        }}
        transition={{ type: "spring", stiffness: 220, damping: 15 }}
        className={cn(
          "relative flex items-center z-10",
          isOrb || isMini ? "gap-1" : isCompact ? "gap-1.5" : "gap-4 sm:gap-5"
        )}
      >
        {/* Left Eye */}
        <motion.div
          animate={{
            scaleY: isWinking || blinkState ? 0.08 : gaze.scaleY,
            scaleX: gaze.scaleX,
          }}
          transition={{ duration: 0.09 }}
          className={cn(
            "bg-white shadow-[0_0_24px_rgba(255,255,255,0.7),0_0_10px_rgba(222,49,33,0.35)] origin-center",
            isOrb
              ? "w-2 h-4.5 rounded-[5px]"
              : isMini
              ? "w-1.5 h-3.5 rounded-[4px]"
              : isCompact
              ? "w-1.5 h-4 rounded-[5px]"
              : "w-6 h-13 sm:w-7 sm:h-14 rounded-[12px] sm:rounded-[13px]"
          )}
        />

        {/* Right Eye */}
        <motion.div
          animate={{
            scaleY: blinkState ? 0.08 : gaze.scaleY,
            scaleX: gaze.scaleX,
          }}
          transition={{ duration: 0.09 }}
          className={cn(
            "bg-white shadow-[0_0_24px_rgba(255,255,255,0.7),0_0_10px_rgba(222,49,33,0.35)] origin-center",
            isOrb
              ? "w-2 h-4.5 rounded-[5px]"
              : isMini
              ? "w-1.5 h-3.5 rounded-[4px]"
              : isCompact
              ? "w-1.5 h-4 rounded-[5px]"
              : "w-6 h-13 sm:w-7 sm:h-14 rounded-[12px] sm:rounded-[13px]"
          )}
        />
      </motion.div>
    </div>
  );
}

