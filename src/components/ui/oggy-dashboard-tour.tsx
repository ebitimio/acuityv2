"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, Sparkles, X } from "lucide-react";
import { AcuityCompanion } from "@/components/ui/acuity-companion";

interface OggyDashboardTourProps {
  userName?: string;
  onClose: () => void;
}

interface TourStep {
  id: string;
  title: string;
  desc: string;
  badge: string;
  // Mascot target position on the screen
  oggyPos: { top: string; left: string };
  // Card placement (above or below mascot)
  cardPlacement: "bottom" | "top";
}

export function OggyDashboardTour({ userName, onClose }: OggyDashboardTourProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const firstName = userName?.trim()?.split(" ")[0] || "there";

  const STEPS: TourStep[] = [
    {
      id: "hero",
      title: "Safe to Spend & Net Worth",
      badge: "Command Center",
      desc: `Here is your financial cockpit, ${firstName}! It displays your total net liquid assets and calculates the exact amount you can safely spend today without running out before payday.`,
      oggyPos: { top: "20%", left: "50%" },
      cardPlacement: "bottom",
    },
    {
      id: "ai",
      title: "Daily Insight & CFO AI",
      badge: "Oggy's Headquarters",
      desc: "This is my home! Tap here anytime to chat with me. Ask questions like 'Where did my money go?' or 'Can I afford dinner tonight?', or have me audit your bank charges.",
      oggyPos: { top: "42%", left: "38%" },
      cardPlacement: "bottom",
    },
    {
      id: "accounts",
      title: "Accounts & Cash Cards",
      badge: "Your Wallets",
      desc: "All your linked banks, debit cards, and cash wallets live here. Swipe left and right to inspect balances, or tap 'See all' to add new accounts and transfer funds.",
      oggyPos: { top: "56%", left: "50%" },
      cardPlacement: "bottom",
    },
    {
      id: "budget",
      title: "Budget & Recurring Bills",
      badge: "Smart Tracking",
      desc: "Monitor your monthly budget limits and recurring subscriptions right here so hidden fees and surprise debits never catch you off guard.",
      oggyPos: { top: "66%", left: "50%" },
      cardPlacement: "top",
    },
    {
      id: "nav",
      title: "Quick Add & Bottom Nav",
      badge: "Instant Actions",
      desc: "Whenever you make or spend money, tap this red (+) button to log it in under 3 seconds! You're ready to master your money. Let's win!",
      oggyPos: { top: "82%", left: "50%" },
      cardPlacement: "top",
    },
  ];

  const current = STEPS[currentIdx];
  const isLast = currentIdx === STEPS.length - 1;

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

  return (
    <div className="fixed inset-0 z-[150] pointer-events-auto select-none overflow-hidden">
      {/* Dimmed Scrim with Smooth Vignette */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
        onClick={handleNext}
      />

      {/* Skip button top-right */}
      <div
        className="absolute right-5 z-[160]"
        style={{ top: "calc(env(safe-area-inset-top) + 16px)" }}
      >
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-[12px] font-medium backdrop-blur-md transition-all active:scale-95"
        >
          <span>Skip Tour</span>
          <X size={14} />
        </button>
      </div>

      {/* Sentient Flying Mascot & Dynamic Tooltip moving from axis to axis */}
      <motion.div
        animate={{
          top: current.oggyPos.top,
          left: current.oggyPos.left,
        }}
        transition={{
          type: "spring",
          stiffness: 170,
          damping: 20,
        }}
        className="absolute -translate-x-1/2 -translate-y-1/2 z-[160] flex flex-col items-center pointer-events-auto max-w-[340px] sm:max-w-sm w-[90vw]"
      >
        {/* Living Oggy Companion (Sentient bobbing motion) */}
        <motion.div
          animate={{
            y: [0, -8, 0],
            rotate: [-2, 2, -2],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative flex items-center justify-center cursor-pointer mb-2"
        >
          {/* Ambient Brand Glow */}
          <div className="absolute w-28 h-28 rounded-full bg-[var(--brand)]/35 blur-xl pointer-events-none" />
          
          <AcuityCompanion
            size="compact"
            isSpeaking={true}
            forceDark={true}
          />
        </motion.div>

        {/* Floating Tooltip Speech Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 0.92, y: current.cardPlacement === "top" ? -10 : 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: current.cardPlacement === "top" ? -10 : 10 }}
            transition={{ duration: 0.25 }}
            className={`w-full p-4 rounded-[22px] bg-[#151518] border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.7)] text-left ${
              current.cardPlacement === "top" ? "-order-1 mb-2" : "mt-2"
            }`}
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
            <h4 className="text-[16px] font-extrabold text-white leading-snug mb-1">
              {current.title}
            </h4>

            {/* Description */}
            <p className="text-[13px] text-white/75 leading-relaxed mb-3.5">
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
                <span>{isLast ? "Let's Win! 🚀" : "Next"}</span>
                {!isLast && <ArrowRight size={14} strokeWidth={2.5} />}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
