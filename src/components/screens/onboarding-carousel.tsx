"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

const SLIDES = [
  {
    title: "Welcome to Acuity.",
    desc: "Your AI-powered personal wealth command center.",
  },
  {
    title: "Know your limits.",
    desc: "We calculate your daily Safe to Spend based on real obligations, so you never run out before payday.",
  },
  {
    title: "Your AI CFO.",
    desc: "Ask questions, get realistic advice, and track your net worth across multiple accounts.",
  },
];

export function OnboardingCarousel({ onComplete }: { onComplete: () => void }) {
  const [current, setCurrent] = useState(0);

  const next = () => {
    if (current < SLIDES.length - 1) setCurrent(current + 1);
    else onComplete();
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-[#0b0b0c] text-white">
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div className="mb-12 flex items-baseline">
          <span className="text-[48px] font-black tracking-tighter text-white">ACUITY</span>
          <span className="text-[48px] font-black tracking-tighter" style={{ color: "#DE3121" }}>.</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-sm"
          >
            <h1 className="text-[28px] font-bold leading-tight mb-4">{SLIDES[current].title}</h1>
            <p className="text-[16px] text-white/60 leading-relaxed">{SLIDES[current].desc}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="pb-[calc(env(safe-area-inset-bottom)+32px)] px-8">
        <div className="mb-8 flex justify-center gap-2">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? "w-8 bg-[#DE3121]" : "w-2 bg-white/20"
              }`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="flex w-full h-14 items-center justify-center gap-2 rounded-2xl font-bold text-[16px] text-black active:scale-95 transition-transform"
          style={{ backgroundColor: "#DE3121" }}
        >
          {current === SLIDES.length - 1 ? "Set up PIN" : "Continue"}
          <ArrowRight size={18} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}