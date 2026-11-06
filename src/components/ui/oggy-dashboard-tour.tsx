"use client";

import { useState, useEffect, useRef } from "react";
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
  const firstName = userName?.trim()?.split(" ")[0] || "there";

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
      id: "accounts",
      selector: "accounts",
      title: "Accounts and Cards",
      badge: "All Wallets",
      desc: "All your linked bank accounts, debit cards, and cash wallets appear here. Swipe through to check individual balances or manage transfers.",
    },
    {
      id: "tools",
      selector: "tools",
      title: "Financial Tools",
      badge: "Budgets & Tracking",
      desc: "Use these tools to monitor your budget, analyze spending categories, and audit recurring commitments to avoid unexpected fees.",
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

  // Measure and scroll to target
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const measureTarget = () => {
      const el = document.querySelector(`[data-tour="${current.selector}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        timeoutId = setTimeout(() => {
          const rect = el.getBoundingClientRect();
          setTargetRect(rect);
        }, 250);
      } else {
        setTargetRect(null);
      }
    };

    measureTarget();

    const handleResizeOrScroll = () => {
      const el = document.querySelector(`[data-tour="${current.selector}"]`);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      }
    };

    window.addEventListener("resize", handleResizeOrScroll);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResizeOrScroll);
    };
  }, [currentIdx, current.selector]);

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

  // Safe layout positioning to prevent cutoff on any mobile device
  const winHeight = typeof window !== "undefined" ? window.innerHeight : 800;
  const targetTop = targetRect ? targetRect.top : winHeight * 0.4;
  const targetHeight = targetRect ? targetRect.height : 100;
  const isTargetInLowerHalf = targetTop > winHeight * 0.45;

  // Mascot vertical anchor
  let oggyY = isTargetInLowerHalf ? Math.max(targetTop - 65, 70) : targetTop + targetHeight + 15;
  // Card vertical placement
  let cardStyle: React.CSSProperties = isTargetInLowerHalf
    ? { bottom: `${Math.max(winHeight - oggyY + 15, 80)}px` }
    : { top: `${Math.min(oggyY + 55, winHeight - 240)}px` };

  return (
    <div className="fixed inset-0 z-[150] pointer-events-auto select-none overflow-hidden">
      {/* Dimmed Backdrop Scrim */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
        onClick={handleNext}
      />

      {/* Target Highlight Ring */}
      {targetRect && (
        <motion.div
          layoutId="tour-highlight"
          className="fixed pointer-events-none rounded-[20px] border-2 border-[var(--brand)] shadow-[0_0_24px_rgba(222,49,33,0.5),inset_0_0_12px_rgba(222,49,33,0.25)] z-[155]"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
        />
      )}

      {/* Top Header / Skip */}
      <div
        className="absolute right-4 z-[160]"
        style={{ top: "calc(env(safe-area-inset-top) + 12px)" }}
      >
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-[12px] font-medium backdrop-blur-md transition-all active:scale-95"
        >
          <span>Skip</span>
          <X size={14} />
        </button>
      </div>

      {/* Floating Oggy Mascot (Moves directly to the active element) */}
      <motion.div
        animate={{
          top: oggyY,
          left: targetRect ? targetRect.left + targetRect.width / 2 : "50%",
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
          <div className="absolute w-20 h-20 rounded-full bg-[var(--brand)]/30 blur-md pointer-events-none" />
          <AcuityCompanion
            size="compact"
            isSpeaking={true}
            forceDark={true}
          />
        </motion.div>
      </motion.div>

      {/* Screen-Fitted Tooltip Card (Guaranteed never to cut off) */}
      <div
        className="fixed inset-x-4 z-[160] flex justify-center pointer-events-auto"
        style={cardStyle}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 0.94, y: isTargetInLowerHalf ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: isTargetInLowerHalf ? 10 : -10 }}
            transition={{ duration: 0.22 }}
            className="w-full max-w-[340px] sm:max-w-[360px] p-4 rounded-[22px] bg-[#141417] border border-white/15 shadow-[0_12px_36px_rgba(0,0,0,0.8)] text-left"
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
            <p className="text-[12.5px] text-white/75 leading-relaxed mb-3.5">
              {current.desc}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
              {currentIdx > 0 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white/80 text-[12px] font-medium transition-colors"
                >
                  <ChevronLeft size={14} />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--brand)] text-[var(--brand-ink)] font-bold text-[12.5px] shadow-md active:scale-95 transition-transform"
              >
                <span>{isLast ? "Done" : "Next"}</span>
                {!isLast && <ArrowRight size={14} strokeWidth={2.5} />}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
