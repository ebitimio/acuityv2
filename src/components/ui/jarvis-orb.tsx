"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { X, ArrowRight, Eye, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AcuityCompanion } from "./acuity-companion";
import {
  getScreenObservation,
  type ScreenObserverData,
  type ScreenObservation,
} from "@/lib/ai/screen-observer";

const STORAGE_KEY = "acuity:jarvis_orb_pos";

interface JarvisOrbProps {
  currentScreen: string;
  observerData: ScreenObserverData;
  onNavigateAI: (prompt?: string) => void;
  className?: string;
}

/**
 * Conversational Typewriter Component
 * Renders text in an organic, living type-in stream with natural cadence
 * and an Acuity Ember glowing pulse cursor while actively speaking.
 */
function TypewriterText({
  text,
  speed = 18,
  delay = 100,
  onStart,
  onComplete,
  className,
}: {
  text: string;
  speed?: number;
  delay?: number;
  onStart?: () => void;
  onComplete?: () => void;
  className?: string;
}) {
  const [displayed, setDisplayed] = useState("");
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setIsDone(false);

    let currentIndex = 0;
    let timeoutId: NodeJS.Timeout;

    const startTimer = setTimeout(() => {
      onStart?.();

      const typeNextChar = () => {
        if (currentIndex < text.length) {
          currentIndex++;
          setDisplayed(text.slice(0, currentIndex));

          const char = text[currentIndex - 1];
          // Organic pauses on punctuation for natural conversational cadence
          const pause =
            char === "." || char === "!" || char === "?"
              ? 80
              : char === "," || char === ";" || char === ":"
              ? 45
              : speed;

          timeoutId = setTimeout(typeNextChar, pause);
        } else {
          setIsDone(true);
          onComplete?.();
        }
      };

      typeNextChar();
    }, delay);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(timeoutId);
    };
  }, [text, speed, delay]);

  return (
    <span className={className}>
      {displayed}
      {!isDone && (
        <span className="inline-block w-1.5 h-3.5 ml-0.5 align-middle bg-[var(--brand)] rounded-xs animate-pulse shadow-[0_0_8px_var(--brand)]" />
      )}
    </span>
  );
}

export function JarvisOrb({
  currentScreen,
  observerData,
  onNavigateAI,
  className,
}: JarvisOrbProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isDrawerSpeaking, setIsDrawerSpeaking] = useState(false);
  const isDraggingRef = useRef(false);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastScreenRef = useRef<string | null>(null);

  // Position motion values for free drag & drop
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const [isNearTop, setIsNearTop] = useState(false);
  const [isNearLeft, setIsNearLeft] = useState(false);

  const [constraints, setConstraints] = useState({
    left: -320,
    right: 0,
    top: -650,
    bottom: 20,
  });

  const [observation, setObservation] = useState<ScreenObservation>(() =>
    getScreenObservation(currentScreen, observerData)
  );

  // Dynamically calculate drag constraints according to screen size
  useEffect(() => {
    const updateConstraints = () => {
      if (typeof window !== "undefined") {
        const orbSize = 54;
        const rightPadding = 16;
        const leftMargin = 16;
        const topSafety = 80; // Safe area below notch/header
        const bottomBase = 90; // Default bottom position
        const bottomMargin = 20;

        const maxLeft = -(window.innerWidth - orbSize - rightPadding - leftMargin);
        const maxTop = -(window.innerHeight - bottomBase - orbSize - topSafety);
        const maxBottom = bottomMargin;

        setConstraints({
          left: Math.min(0, maxLeft),
          right: 0,
          top: Math.min(0, maxTop),
          bottom: maxBottom,
        });

        const currentX = x.get();
        const currentY = y.get();
        setIsNearLeft(currentX < maxLeft * 0.55);
        setIsNearTop(currentY < maxTop * 0.6);
      }
    };

    updateConstraints();
    window.addEventListener("resize", updateConstraints);

    // Restore saved drag position from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          x.set(parsed.x);
          y.set(parsed.y);
        }
      }
    } catch {}

    return () => window.removeEventListener("resize", updateConstraints);
  }, [x, y]);

  // 1. Silently keep observation data fresh without popping bubbles
  useEffect(() => {
    const obs = getScreenObservation(currentScreen, observerData);
    setObservation(obs);
  }, [currentScreen, observerData]);

  // 2. Drop observation bubble ONLY ONCE when entering a new screen
  useEffect(() => {
    // Prevent repeated popups on the same screen as user scrolls or page updates
    if (lastScreenRef.current === currentScreen) return;
    lastScreenRef.current = currentScreen;

    // Clear any pending dismiss timers
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
    }

    // Subtle proactive chip-in once when opening a new screen
    setShowSpeechBubble(false);
    setIsSpeaking(false);
    const enterTimer = setTimeout(() => {
      setShowSpeechBubble(true);
    }, 900);

    return () => {
      clearTimeout(enterTimer);
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, [currentScreen]);

  const handleSpeechComplete = () => {
    setIsSpeaking(false);
    // Allow user 6.5s to read the completed message before fading away
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
    }
    dismissTimerRef.current = setTimeout(() => {
      setShowSpeechBubble(false);
    }, 6500);
  };

  const handleDragStart = () => {
    isDraggingRef.current = true;
    setShowSpeechBubble(false);
    setIsSpeaking(false);
  };

  const handleDrag = () => {
    const currentX = x.get();
    const currentY = y.get();
    setIsNearLeft(currentX < constraints.left * 0.55);
    setIsNearTop(currentY < constraints.top * 0.6);
  };

  const handleDragEnd = () => {
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 140);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ x: x.get(), y: y.get() })
      );
    } catch {}
  };

  const handleOrbClick = () => {
    if (isDraggingRef.current) return;
    
    // If speech bubble is currently hidden and drawer is closed, tapping the orb re-shows the observation!
    if (!showSpeechBubble && !isOpen) {
      setShowSpeechBubble(true);
    } else {
      setShowSpeechBubble(false);
      setIsSpeaking(false);
      setIsOpen(!isOpen);
    }
  };

  const handleActionClick = (prompt: string) => {
    setIsOpen(false);
    onNavigateAI(prompt);
  };

  const handleOpenAiScreen = () => {
    setIsOpen(false);
    onNavigateAI();
  };

  return (
    <>
      {/* Draggable Mascot Orb & Attached Speech Bubble Container */}
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.15}
        dragConstraints={constraints}
        style={{ x, y }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        className={cn(
          "fixed bottom-[90px] right-4 z-40 flex pointer-events-none select-none touch-none",
          isNearTop ? "flex-col-reverse" : "flex-col",
          isNearLeft ? "items-start" : "items-end",
          className
        )}
      >
        {/* Proactive Speech Bubble ("Chip In" with Type-in Motion) */}
        <AnimatePresence>
          {showSpeechBubble && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: isNearTop ? -10 : 10, scale: 0.9, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: isNearTop ? -6 : 6, scale: 0.92, filter: "blur(2px)" }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              onClick={(e) => {
                e.stopPropagation();
                handleOrbClick();
              }}
              onPointerDownCapture={(e) => e.stopPropagation()}
              className={cn(
                "pointer-events-auto max-w-[270px] sm:max-w-[310px] cursor-pointer rounded-2xl border border-white/10 bg-[#141416]/90 p-3 shadow-[0_12px_36px_rgba(0,0,0,0.65),0_0_20px_rgba(222,49,33,0.15)] backdrop-blur-2xl transition-transform hover:scale-[1.02] active:scale-[0.98]",
                isNearTop ? "mt-2" : "mb-2"
              )}
            >
              <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/5">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--brand)] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--brand)]" />
                  </span>
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-white/50 font-mono">
                    {observation.badge}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSpeechBubble(false);
                    setIsSpeaking(false);
                  }}
                  className="text-white/40 hover:text-white/80 p-0.5 rounded-full hover:bg-white/5 transition-colors"
                  aria-label="Dismiss"
                >
                  <X size={12} />
                </button>
              </div>

              {/* Active Conversational Type-in Observation */}
              <p className="mt-1.5 text-[12.5px] leading-snug text-white/90 min-h-[36px]">
                <TypewriterText
                  text={observation.chipInMessage}
                  speed={17}
                  delay={120}
                  onStart={() => setIsSpeaking(true)}
                  onComplete={handleSpeechComplete}
                />
              </p>

              <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-[var(--brand)] pt-1 border-t border-white/5">
                <span>Tap to see observations</span>
                <ChevronRight size={12} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Draggable Glass Orb Mascot */}
        <motion.button
          onClick={() => {
            if (isDraggingRef.current) return;
            handleOrbClick();
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          whileDrag={{ scale: 1.12, cursor: "grabbing" }}
          aria-label="Acuity Jarvis AI Assistant - Drag to move or tap to open"
          title="Drag to move anywhere • Tap for screen observations"
          className={cn(
            "pointer-events-auto relative flex h-13 w-13 items-center justify-center rounded-full",
            "border border-white/15 bg-[#121214]/85 backdrop-blur-2xl",
            "shadow-[0_8px_32px_rgba(0,0,0,0.7),0_0_24px_rgba(222,49,33,0.35)]",
            "cursor-grab active:cursor-grabbing focus:outline-none touch-none",
            "transition-shadow duration-300"
          )}
        >
          {/* Subtle outer breathing ring */}
          <span
            className="absolute -inset-1 rounded-full opacity-50 blur-sm pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, color-mix(in srgb, var(--brand) 60%, transparent) 0%, transparent 70%)",
            }}
          />

          {/* Living Acuity Eyes (Attentive and nods conversationally while speaking) */}
          <div className="relative z-10 w-9 h-9 flex items-center justify-center pointer-events-none">
            <AcuityCompanion size="orb" isSpeaking={isSpeaking} />
          </div>

          {/* Activity Dot */}
          <span className="absolute top-0.5 right-0.5 flex h-2.5 w-2.5 pointer-events-none">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--brand)] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--brand)] border-2 border-[#121214]" />
          </span>
        </motion.button>
      </motion.div>

      {/* Expandable Jarvis Glass Drawer / Popover */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            {/* Glass Sheet */}
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] rounded-t-[32px] border-t border-white/10 bg-[#121214]/95 p-5 pb-8 backdrop-blur-3xl shadow-[0_-12px_48px_rgba(0,0,0,0.85)] overflow-y-auto"
            >
              {/* Grab handle */}
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />

              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#1c1c1f] border border-white/10 flex items-center justify-center shadow-inner">
                    <AcuityCompanion size="orb" isSpeaking={isDrawerSpeaking} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-bold tracking-tight text-white">
                        Acuity Assistant
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand)]/15 px-2 py-0.5 text-[10.5px] font-medium text-[var(--brand)] border border-[var(--brand)]/20">
                        <Eye size={10} /> Live
                      </span>
                    </div>
                    <p className="text-[12px] text-white/50">
                      {observation.badge} • Context aware
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full bg-white/5 p-2 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Proactive Screen Insights with Living Type-in Motion */}
              <div className="mt-4 rounded-2xl bg-white/[0.03] border border-white/5 p-3.5">
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--brand)] uppercase tracking-wider font-mono">
                  <span className="font-black text-[13px] tracking-tight leading-none">A.</span>
                  <span>Screen Observations</span>
                </div>
                <div className="mt-2.5 space-y-2">
                  {observation.observations.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-[13px] text-white/80 leading-relaxed">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--brand)]" />
                      <TypewriterText
                        text={item}
                        speed={14}
                        delay={140 + idx * 260}
                        onStart={() => setIsDrawerSpeaking(true)}
                        onComplete={() => {
                          if (idx === observation.observations.length - 1) {
                            setIsDrawerSpeaking(false);
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions (Instant AI Inquiries) */}
              <div className="mt-4">
                <div className="text-[12px] font-medium text-white/50 uppercase tracking-wider px-1 mb-2 font-mono">
                  Quick Inquiries
                </div>
                <div className="space-y-2">
                  {observation.quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleActionClick(action.prompt)}
                      className="group flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left transition-all hover:border-[var(--brand)]/30 hover:bg-white/[0.06] active:scale-[0.99]"
                    >
                      <span className="text-[13.5px] font-medium text-white/90 group-hover:text-white">
                        {action.label}
                      </span>
                      <ArrowRight
                        size={15}
                        className="text-white/40 transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--brand)]"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Open Full AI Screen CTA */}
              <div className="mt-5 pt-3 border-t border-white/10">
                <button
                  onClick={handleOpenAiScreen}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--brand)] py-3 px-4 text-[14px] font-bold text-black shadow-[0_4px_24px_rgba(222,49,33,0.35)] transition-all hover:brightness-110 active:scale-[0.98]"
                >
                  <span className="font-black text-[15px] tracking-tight leading-none text-black">A.</span>
                  <span>Open Full Acuity CFO</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
