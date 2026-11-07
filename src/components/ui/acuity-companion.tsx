"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AcuityCompanionProps {
  isThinking?: boolean;
  hasInput?: boolean;
  isSpeaking?: boolean;
  isSmiling?: boolean;
  hasCap?: boolean;
  size?: "large" | "compact" | "orb" | "mini";
  financialMood?: "celebrating" | "calm" | "concerned" | "neutral";
  isStatic?: boolean;
  onTap?: () => void;
  className?: string;
  forceDark?: boolean;
}

/**
 * Living Acuity AI Companion & Mascot (Oggy)
 * Features:
 * - Expressive white pill eyes with organic blinking & reading gaze scan
 * - Animated mouth with matching glowing highlight that talks when speaking/typing
 * - Financial mood integration (concerned when budget > 90% or negative cashflow, celebrating when healthy)
 * - Stylish cap with signature "A." Acuity embroidery
 * - Warm radiant breathing Acuity Ember aura
 * - Battery-friendly static mode for past chat bubbles
 * - Accessible with keyboard support and respects reduced motion
 */
export function AcuityCompanion({
  isThinking = false,
  hasInput = false,
  isSpeaking = false,
  isSmiling = false,
  hasCap = true,
  size = "large",
  financialMood = "calm",
  isStatic = false,
  onTap,
  className,
  forceDark = false,
}: AcuityCompanionProps) {
  const [blinkState, setBlinkState] = useState(false);
  const [isWinking, setIsWinking] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check prefers-reduced-motion safely
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.matchMedia) {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReducedMotion(mq.matches);
        const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
        if (mq.addEventListener) {
          mq.addEventListener("change", handler);
          return () => mq.removeEventListener("change", handler);
        } else if ((mq as any).addListener) {
          (mq as any).addListener(handler);
          return () => (mq as any).removeListener(handler);
        }
      }
    } catch {}
  }, []);

  // Baseline gaze posture influenced by financial mood
  const defaultGaze =
    financialMood === "concerned"
      ? { x: 0, y: 1.5, rotate: -2, scaleY: 0.9, scaleX: 1.04 }
      : financialMood === "celebrating"
      ? { x: 0, y: -1, rotate: 6, scaleY: 0.92, scaleX: 1.1 }
      : { x: 0, y: 0, rotate: 7, scaleY: 1, scaleX: 1 };

  const [gaze, setGaze] = useState(defaultGaze);

  useEffect(() => {
    if (isStatic || reducedMotion) {
      setGaze(defaultGaze);
    }
  }, [financialMood, isStatic, reducedMotion]);

  // Natural organic blinking with single and double flutter blinks (disabled if static or reduced motion)
  useEffect(() => {
    if (isStatic || reducedMotion) return;

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
  }, [isStatic, reducedMotion]);

  // Expressive eye movements (disabled if static or reduced motion)
  useEffect(() => {
    if (isStatic || reducedMotion) return;

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

    if (isSpeaking) {
      // Speaking: Active conversational eye contact with subtle rhythmic nods and speech pulses
      let speakStep = 0;
      const speakInterval = setInterval(() => {
        speakStep = (speakStep + 1) % 4;
        const speakPositions = [
          { x: 0, y: -1, rotate: 3, scaleY: 1.05, scaleX: 0.98 },
          { x: 1, y: 0.5, rotate: 6, scaleY: 0.95, scaleX: 1.02 },
          { x: -1, y: -0.5, rotate: 1, scaleY: 1.02, scaleX: 0.99 },
          { x: 0.5, y: 1, rotate: 5, scaleY: 0.97, scaleX: 1.01 },
        ];
        setGaze(speakPositions[speakStep]);
      }, 200);

      return () => clearInterval(speakInterval);
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
        const gazePatterns =
          financialMood === "concerned"
            ? [
                { x: 0, y: 1.5, rotate: -2, scaleY: 0.9, scaleX: 1.04 },
                { x: -2, y: 1, rotate: -4, scaleY: 0.88, scaleX: 1.02 },
                { x: 2, y: 1, rotate: 0, scaleY: 0.88, scaleX: 1.02 },
              ]
            : [
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
  }, [isThinking, hasInput, isSpeaking, isStatic, reducedMotion, financialMood]);

  const handleTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWinking(true);
    setTimeout(() => setIsWinking(false), 320);
    onTap?.();
  };

  const isOrb = size === "orb";
  const isCompact = size === "compact";
  const isMini = size === "mini";

  // Suppress smile if in concerned financial mood unless explicitly forced
  const effectiveSmiling = isSmiling && financialMood !== "concerned";

  return (
    <div
      role={onTap ? "button" : "img"}
      tabIndex={onTap ? 0 : undefined}
      aria-label="Oggy AI Assistant Mascot"
      onKeyDown={(e) => {
        if (onTap && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onTap();
        }
      }}
      onClick={handleTap}
      className={cn(
        "relative flex items-center justify-center select-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] rounded-2xl",
        onTap ? "cursor-pointer transition-transform active:scale-95" : "cursor-default",
        isOrb
          ? "h-full w-full"
          : isMini
          ? "h-6 w-9"
          : isCompact
          ? "h-8 w-12"
          : "h-36 sm:h-40 w-full my-1",
        className
      )}
      title="Oggy AI • Tap to say hi!"
    >
      {/* Radiant Brand Ember Aura (Breathing Glow - static when isStatic is true) */}
      <motion.div
        animate={
          isStatic || reducedMotion
            ? { scale: 1, opacity: 0.4 }
            : {
                scale: isThinking ? [1, 1.25, 1] : isSpeaking ? [1, 1.2, 1] : [1, 1.08, 1],
                opacity: isThinking ? [0.65, 0.95, 0.65] : isSpeaking ? [0.55, 0.9, 0.55] : isOrb || isMini ? [0.45, 0.75, 0.45] : isCompact ? [0.4, 0.65, 0.4] : [0.38, 0.58, 0.38],
              }
        }
        transition={
          isStatic || reducedMotion
            ? { duration: 0 }
            : {
                duration: isSpeaking ? 0.8 : isThinking ? 1.4 : 4.2,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
        className={cn(
          "absolute rounded-full pointer-events-none",
          isOrb || isMini
            ? "w-11 h-11 blur-xs"
            : isCompact
            ? "w-14 h-14 blur-md"
            : "w-52 h-52 sm:w-60 sm:h-60 blur-2xl"
        )}
        style={{
          background:
            financialMood === "concerned"
              ? "radial-gradient(circle, color-mix(in srgb, #f59e0b 40%, transparent) 0%, color-mix(in srgb, #ef4444 14%, transparent) 50%, transparent 72%)"
              : "radial-gradient(circle, color-mix(in srgb, var(--brand) 45%, transparent) 0%, color-mix(in srgb, var(--brand) 16%, transparent) 46%, transparent 72%)",
        }}
      />

      {/* Whole Head / Face Container with Spring Motion (Moves cap, eyes & mouth together) */}
      <motion.div
        animate={{
          x: gaze.x,
          y: gaze.y,
          rotate: gaze.rotate,
        }}
        transition={{ type: "spring", stiffness: 220, damping: 15 }}
        className="relative flex flex-col items-center z-10"
      >
        {/* Stylish Cap with "A." Branding */}
        {hasCap && (
          <div className="relative flex flex-col items-center">
            {/* Top Button / Squatchee */}
            <div
              className={cn(
                "rounded-full bg-[var(--brand)] shadow-[0_0_6px_var(--brand)]",
                isOrb || isMini
                  ? "w-1 h-0.5"
                  : isCompact
                  ? "w-1.5 h-0.75"
                  : "w-3 h-1.5"
              )}
            />

            {/* Cap Crown (Dome) with "A." embroidery */}
            <div
              className={cn(
                "relative flex items-center justify-center bg-gradient-to-b from-[#2a2a2e] via-[#1c1c20] to-[#141416] border-t border-x border-white/20 shadow-md",
                isOrb
                  ? "w-6 h-2.5 rounded-t-[5px]"
                  : isMini
                  ? "w-5 h-2 rounded-t-[4px]"
                  : isCompact
                  ? "w-7.5 h-3 rounded-t-[6px]"
                  : "w-24 sm:w-28 h-9 sm:h-10 rounded-t-[18px]"
              )}
            >
              {/* "A." Embroidered Logo Badge */}
              <div className="flex items-baseline font-black tracking-tighter leading-none select-none">
                <span
                  className={cn(
                    "text-white",
                    isOrb
                      ? "text-[6px]"
                      : isMini
                      ? "text-[5px]"
                      : isCompact
                      ? "text-[7.5px]"
                      : "text-[14px] sm:text-[15px]"
                  )}
                >
                  A
                </span>
                <span
                  className={cn(
                    "text-[var(--brand)]",
                    isOrb
                      ? "text-[6px]"
                      : isMini
                      ? "text-[5px]"
                      : isCompact
                      ? "text-[7.5px]"
                      : "text-[14px] sm:text-[15px]"
                  )}
                >
                  .
                </span>
              </div>
            </div>

            {/* Visor / Brim (Tilted with attitude) */}
            <div
              className={cn(
                "rounded-full bg-gradient-to-r from-[#1c1c20] via-[#242428] to-[#1c1c20] border-t border-white/25 shadow-md -rotate-[3deg]",
                isOrb
                  ? "w-7.5 h-1 -mt-0.5"
                  : isMini
                  ? "w-6 h-0.75 -mt-0.5"
                  : isCompact
                  ? "w-9 h-1.2 -mt-0.5"
                  : "w-28 sm:w-32 h-3.5 sm:h-4 -mt-1"
              )}
            />
          </div>
        )}

        {/* Eyes Container */}
        <div
          className={cn(
            "flex items-center",
            isOrb || isMini
              ? "gap-1 mt-0.5"
              : isCompact
              ? "gap-1.5 mt-0.5"
              : "gap-4 sm:gap-5 mt-2.5 sm:mt-3"
          )}
        >
          {/* Left Eye */}
          <motion.div
            animate={{
              scaleY: isWinking || blinkState ? 0.08 : effectiveSmiling ? 0.75 : financialMood === "concerned" ? 0.88 : gaze.scaleY,
              scaleX: effectiveSmiling ? 1.08 : financialMood === "concerned" ? 1.04 : gaze.scaleX,
              y: effectiveSmiling ? 1 : 0,
            }}
            transition={{ duration: 0.12 }}
            className={cn(
              "bg-white origin-center border",
              forceDark ? "border-transparent" : "border-black/25 dark:border-transparent",
              isOrb
                ? "w-2 h-4.5 rounded-[5px]"
                : isMini
                ? "w-1.5 h-3.5 rounded-[4px]"
                : isCompact
                ? "w-1.5 h-4 rounded-[5px]"
                : "w-6 h-13 sm:w-7 sm:h-14 rounded-[12px] sm:rounded-[13px]"
            )}
            style={{
              boxShadow: "0 0 20px rgba(255,255,255,0.85), 0 2px 8px rgba(0,0,0,0.18), 0 0 10px color-mix(in srgb, var(--brand) 40%, transparent)",
            }}
          />

          {/* Right Eye */}
          <motion.div
            animate={{
              scaleY: blinkState ? 0.08 : effectiveSmiling ? 0.75 : financialMood === "concerned" ? 0.88 : gaze.scaleY,
              scaleX: effectiveSmiling ? 1.08 : financialMood === "concerned" ? 1.04 : gaze.scaleX,
              y: effectiveSmiling ? 1 : 0,
            }}
            transition={{ duration: 0.12 }}
            className={cn(
              "bg-white origin-center border",
              forceDark ? "border-transparent" : "border-black/25 dark:border-transparent",
              isOrb
                ? "w-2 h-4.5 rounded-[5px]"
                : isMini
                ? "w-1.5 h-3.5 rounded-[4px]"
                : isCompact
                ? "w-1.5 h-4 rounded-[5px]"
                : "w-6 h-13 sm:w-7 sm:h-14 rounded-[12px] sm:rounded-[13px]"
            )}
            style={{
              boxShadow: "0 0 20px rgba(255,255,255,0.85), 0 2px 8px rgba(0,0,0,0.18), 0 0 10px color-mix(in srgb, var(--brand) 40%, transparent)",
            }}
          />
        </div>

        {/* Animated Mouth (Same white highlight as the eyes, motion when talking/typing, smile curve) */}
        <motion.div
          animate={
            isSpeaking
              ? {
                  scaleY: [0.6, 2.4, 0.8, 2.8, 1.0, 2.0],
                  scaleX: [1.0, 1.25, 0.85, 1.2, 0.95, 1.15],
                  y: 0,
                }
              : effectiveSmiling
              ? {
                  scaleY: 0.6,
                  scaleX: 1.55,
                  y: -1,
                }
              : isWinking
              ? { scaleY: 1.8, scaleX: 1.4, y: 0 }
              : isThinking
              ? { scaleY: 0.6, scaleX: 0.7, y: 0 }
              : financialMood === "concerned"
              ? { scaleY: 0.65, scaleX: 0.85, y: 1 }
              : { scaleY: 1, scaleX: 1, y: 0 }
          }
          transition={
            isSpeaking
              ? {
                  duration: 0.52,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
              : { duration: 0.22, ease: "easeOut" }
          }
          className={cn(
            "bg-white origin-center rounded-full border",
            forceDark ? "border-transparent" : "border-black/20 dark:border-transparent",
            isOrb
              ? "w-2 h-0.75 mt-0.75"
              : isMini
              ? "w-1.5 h-0.5 mt-0.5"
              : isCompact
              ? "w-2.5 h-1 mt-1"
              : "w-6 sm:w-7 h-2 sm:h-2.5 mt-2.5 sm:mt-3"
          )}
          style={{
            boxShadow: "0 0 20px rgba(255,255,255,0.85), 0 2px 6px rgba(0,0,0,0.18), 0 0 10px color-mix(in srgb, var(--brand) 40%, transparent)",
          }}
        />
      </motion.div>
    </div>
  );
}
