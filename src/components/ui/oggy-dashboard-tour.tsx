"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, X } from "lucide-react";
import { AcuityCompanion } from "@/components/ui/acuity-companion";

interface OggyDashboardTourProps {
  userName?: string;
  onClose: () => void;
}

interface TourStep {
  id: string;
  selector: string;
  title: string;
  badge: string;
  desc: string;
}

export function OggyDashboardTour({ userName, onClose }: OggyDashboardTourProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [winSize, setWinSize] = useState({ width: 400, height: 800 });

  const firstName = userName?.trim()?.split(" ")[0] || "there";

  // Ordered strictly in the visual layout order from top to bottom
  const STEPS: TourStep[] = [
    {
      id: "hero",
      selector: "hero",
      title: "Safe to Spend",
      badge: "Command Center",
      desc: `This hero card calculates the exact amount you can spend today based on your liquid assets and days until your next payday, so you never go broke.`,
    },
    {
      id: "daily-insight",
      selector: "daily-insight",
      title: "Daily Insight",
      badge: "Smart Monitoring",
      desc: "Here you will receive personalized updates and recommendations on your cash flow, top spending categories, and upcoming obligations.",
    },
    {
      id: "tools",
      selector: "tools",
      title: "Financial Tools",
      badge: "Budgets & Tracking",
      desc: "Use these tools to monitor your budget, analyze spending categories, and audit recurring commitments to avoid unexpected fees.",
    },
    {
      id: "accounts",
      selector: "accounts",
      title: "Accounts and Cards",
      badge: "All Wallets",
      desc: "All your linked bank accounts, debit cards, and cash wallets appear here. Swipe through to check individual balances or manage transfers.",
    },
    {
      id: "nav-ai",
      selector: "nav-ai",
      title: "The A. Wealth Manager Button",
      badge: "Direct Consultation",
      desc: "Tap this A. button from anywhere in the app to open our direct wealth management chat. You can ask for advice, check balances, or audit transactions anytime.",
    },
    {
      id: "nav-add",
      selector: "nav-add",
      title: "Quick Add Action",
      badge: "Instant Logging",
      desc: "Whenever you spend or receive money, tap this red (+) button to log your transaction in seconds. You are all set to manage your wealth.",
    },
  ];

  const current = STEPS[currentIdx];
  const isLast = currentIdx === STEPS.length - 1;

  // Track window dimensions
  useEffect(() => {
    const handleResize = () => {
      setWinSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update target rect directly
  const measureTarget = useCallback(() => {
    const el = document.querySelector(`[data-tour="${current.selector}"]`);
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setTargetRect(rect);
      }
    } else {
      setTargetRect(null);
    }
  }, [current.selector]);

  // Target acquisition and scroll synchronization
  useEffect(() => {
    // 1. Measure immediately so highlight ring doesn't lag on the previous element
    measureTarget();

    // 2. Smoothly bring the target element into view
    const el = document.querySelector(`[data-tour="${current.selector}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    // 3. Re-sample bounding rect throughout the smooth scroll transition
    const timers = [
      setTimeout(measureTarget, 80),
      setTimeout(measureTarget, 200),
      setTimeout(measureTarget, 380),
      setTimeout(measureTarget, 600),
    ];

    // 4. Capture scroll on any parent container or document
    const handleScrollCapture = () => measureTarget();
    document.addEventListener("scroll", handleScrollCapture, { capture: true, passive: true });
    window.addEventListener("resize", handleScrollCapture);

    return () => {
      timers.forEach(clearTimeout);
      document.removeEventListener("scroll", handleScrollCapture, { capture: true });
      window.removeEventListener("resize", handleScrollCapture);
    };
  }, [currentIdx, current.selector, measureTarget]);

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  // Geometry calculations
  const winWidth = winSize.width;
  const winHeight = winSize.height;

  // Cutout margin around active element
  const pad = 6;
  const cutL = targetRect ? Math.max(0, Math.round(targetRect.left - pad)) : 0;
  const cutT = targetRect ? Math.max(0, Math.round(targetRect.top - pad)) : 0;
  const cutR = targetRect ? Math.min(winWidth, Math.round(targetRect.right + pad)) : 0;
  const cutB = targetRect ? Math.min(winHeight, Math.round(targetRect.bottom + pad)) : 0;

  // True spotlight cutout: everything is blurred except the target rectangle
  const polygonCutout = targetRect
    ? `polygon(
        0px 0px,
        0px ${winHeight}px,
        ${cutL}px ${winHeight}px,
        ${cutL}px ${cutT}px,
        ${cutR}px ${cutT}px,
        ${cutR}px ${cutB}px,
        ${cutL}px ${cutB}px,
        ${cutL}px ${winHeight}px,
        ${winWidth}px ${winHeight}px,
        ${winWidth}px 0px
      )`
    : undefined;

  // Target relative positioning
  const targetTop = targetRect ? targetRect.top : winHeight * 0.4;
  const targetBottom = targetRect ? targetRect.bottom : winHeight * 0.55;
  const targetCenterX = targetRect ? targetRect.left + targetRect.width / 2 : winWidth / 2;

  // Clamp horizontal mascot anchor
  const oggyX = Math.min(Math.max(64, targetCenterX), winWidth - 64);

  // Is target element located in the lower half of the screen?
  const isTargetInLowerHalf = targetTop > winHeight * 0.44;

  let oggyY = winHeight * 0.45;
  let cardStyle: React.CSSProperties = {};

  if (targetRect) {
    if (isTargetInLowerHalf) {
      // Target is low down (tools, accounts, nav) -> Card at top, Oggy directly above target
      cardStyle = {
        top: "calc(env(safe-area-inset-top) + 54px)",
      };
      oggyY = Math.max(targetTop - 52, 175);
    } else {
      // Target is high up (hero, daily insight) -> Card at bottom, Oggy directly below target
      cardStyle = {
        bottom: "calc(env(safe-area-inset-bottom) + 72px)",
      };
      oggyY = Math.min(targetBottom + 48, winHeight - 240);
    }
  }

  return (
    <div className="fixed inset-0 z-[150] pointer-events-auto select-none overflow-hidden">
      {/* 
        Theatrical Spotlight Scrim with Blur Cutout:
        Blurs and dims EVERYTHING ELSE on the dashboard, leaving the target 100% sharp and unblurred
      */}
      <div
        className="fixed inset-0 z-[151] pointer-events-auto cursor-pointer transition-[clip-path] duration-250 ease-out"
        style={{
          clipPath: polygonCutout,
          WebkitClipPath: polygonCutout,
          backgroundColor: "rgba(0, 0, 0, 0.72)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
        onClick={handleNext}
      />

      {/* Target Highlight Ring (Crisp luminous border around clear window) */}
      {targetRect && (
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          className="fixed pointer-events-none rounded-[22px] border-2 border-[var(--brand)] shadow-[0_0_24px_rgba(222,49,33,0.85),inset_0_0_12px_rgba(222,49,33,0.3)] z-[155]"
          style={{
            top: cutT,
            left: cutL,
            width: cutR - cutL,
            height: cutB - cutT,
          }}
        />
      )}

      {/* Top Header / Skip button */}
      <div
        className="absolute right-4 z-[165]"
        style={{ top: "calc(env(safe-area-inset-top) + 12px)" }}
      >
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-[12px] font-medium backdrop-blur-md transition-all active:scale-95 shadow-md"
        >
          <span>Skip</span>
          <X size={14} />
        </button>
      </div>

      {/* Floating Oggy Mascot (Sentient bobbing motion) */}
      <motion.div
        animate={{
          top: oggyY,
          left: oggyX,
        }}
        transition={{
          type: "spring",
          stiffness: 180,
          damping: 22,
        }}
        className="fixed -translate-x-1/2 -translate-y-1/2 z-[160] flex flex-col items-center pointer-events-none"
      >
        <motion.div
          animate={{
            y: [0, -6, 0],
            rotate: [-2, 2, -2],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative flex items-center justify-center pointer-events-auto"
        >
          <div className="absolute w-20 h-20 rounded-full bg-[var(--brand)]/35 blur-md pointer-events-none" />
          <AcuityCompanion
            size="compact"
            isSpeaking={true}
            forceDark={true}
          />
        </motion.div>
      </motion.div>

      {/* Screen-Fitted Tooltip Card */}
      <div
        className="fixed inset-x-4 z-[160] flex justify-center pointer-events-auto"
        style={cardStyle}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 0.94, y: isTargetInLowerHalf ? -8 : 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: isTargetInLowerHalf ? -8 : 8 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-[340px] sm:max-w-[360px] p-4 rounded-[22px] bg-[#141417] border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.85)] text-left"
          >
            {/* Header info */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[var(--brand)] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] animate-pulse" />
                {current.badge}
              </span>
              <span className="text-[11px] font-mono text-white/40">
                {currentIdx + 1} of {STEPS.length}
              </span>
            </div>

            {/* Title */}
            <h4 className="text-[15.5px] font-bold text-white leading-snug mb-1">
              {current.title}
            </h4>

            {/* Description */}
            <p className="text-[12.5px] text-white/75 leading-relaxed mb-3">
              {current.desc}
            </p>

            {/* Actions: Perfectly aligned Back and Next buttons */}
            <div className="flex items-center justify-between gap-3 pt-3 mt-1.5 border-t border-white/10">
              {currentIdx > 0 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="h-9 px-4 rounded-full bg-white/10 hover:bg-white/15 text-white/85 text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                >
                  <ChevronLeft size={15} />
                  <span>Back</span>
                </button>
              ) : (
                <div className="w-16" />
              )}

              <button
                type="button"
                onClick={handleNext}
                className="h-9 px-5 rounded-full bg-[var(--brand)] text-[var(--brand-ink)] font-bold text-[12.5px] flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform"
              >
                <span>{isLast ? "Done" : "Next"}</span>
                {!isLast && <ArrowRight size={15} strokeWidth={2.5} />}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
