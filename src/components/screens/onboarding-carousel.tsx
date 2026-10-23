"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CreditCard, Coins, Sparkles, BrainCircuit, PieChart, ShieldCheck, MessageSquare, Lightbulb } from "lucide-react";

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
    <div className="fixed inset-0 z-[200] flex flex-col bg-[#0b0b0c] text-white overflow-hidden">
      
      {/* Animated Backgrounds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <AnimatePresence mode="wait">
          {current === 0 && <Slide1Wealth key="s1" />}
          {current === 1 && <Slide2Budget key="s2" />}
          {current === 2 && <Slide3AI key="s3" />}
        </AnimatePresence>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center relative z-10 pt-20">
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

      <div className="pb-[calc(env(safe-area-inset-bottom)+32px)] px-8 relative z-10">
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

// ---------------------------------------------------------
// SLIDE 1: Floating Card & Bouncing Coins
// ---------------------------------------------------------
function Slide1Wealth() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center"
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute h-[400px] w-[400px] rounded-full bg-[#DE3121] blur-[100px]"
      />

      <div className="absolute flex gap-4 opacity-20 mt-20">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: [100, 0, 100], opacity: [0, 1, 0] }}
            transition={{ 
              duration: 2, 
              delay: i * 0.4, 
              repeat: Infinity, 
              ease: "easeInOut",
              repeatDelay: 1
            }}
          >
            <Coins size={48} className="text-[#DE3121]" strokeWidth={1} />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ y: 50, rotateX: 45, rotateZ: -20, opacity: 0 }}
        animate={{ 
          y: [-10, 10, -10], 
          rotateX: 20, 
          rotateZ: -15,
          opacity: 0.15 
        }}
        transition={{ 
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          rotateX: { duration: 1.5, ease: "easeOut" },
          rotateZ: { duration: 1.5, ease: "easeOut" },
          opacity: { duration: 1.5 }
        }}
        className="relative flex h-56 w-[340px] rounded-2xl border border-[#DE3121]/30 bg-gradient-to-br from-[#DE3121]/20 to-transparent p-6 shadow-2xl backdrop-blur-sm"
        style={{ perspective: 1000 }}
      >
        <div className="flex w-full flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[20px] font-black tracking-tighter text-[#DE3121]">ACUITY.</span>
            <CreditCard size={28} className="text-[#DE3121]" />
          </div>
          <div>
            <div className="h-8 w-12 rounded-md bg-[#DE3121]/30 mb-4" />
            <div className="flex gap-4">
              <div className="h-2 w-12 rounded bg-[#DE3121]/30" />
              <div className="h-2 w-12 rounded bg-[#DE3121]/30" />
              <div className="h-2 w-12 rounded bg-[#DE3121]/30" />
              <div className="h-2 w-12 rounded bg-[#DE3121]/30" />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------
// SLIDE 2: 3D Rotating Donut Chart & Floating Tiles
// ---------------------------------------------------------
function Slide2Budget() {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center"
      style={{ perspective: 1000 }}
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.08, 0.05] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute h-[350px] w-[350px] rounded-full bg-[#DE3121] blur-[100px]"
      />

      <motion.div
        animate={{ y: [-10, 10, -10], rotateZ: [5, 10, 5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-10 top-1/4 flex h-24 w-20 flex-col justify-between rounded-xl border border-[#DE3121]/20 bg-[#121213]/80 p-3 shadow-xl backdrop-blur-md"
      >
        <ShieldCheck size={18} className="text-[#DE3121]" />
        <div>
          <p className="text-[8px] text-white/50">Safe to</p>
          <p className="text-[10px] font-bold text-[#DE3121]">Spend</p>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [10, -10, 10], rotateZ: [-5, -10, -5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-10 bottom-1/3 flex h-24 w-20 flex-col justify-between rounded-xl border border-[#DE3121]/20 bg-[#121213]/80 p-3 shadow-xl backdrop-blur-md"
      >
        <PieChart size={18} className="text-[#DE3121]" />
        <div>
          <p className="text-[8px] text-white/50">Budget</p>
          <p className="text-[10px] font-bold text-[#DE3121]">Set</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ rotateX: 60, scale: 0.8, opacity: 0 }}
        animate={{ 
          rotateX: 30, 
          rotateY: [-15, 15, -15],
          scale: 1, 
          opacity: 0.15 
        }}
        transition={{ 
          rotateX: { duration: 1.5, ease: "easeOut" },
          scale: { duration: 1.5, ease: "easeOut" },
          opacity: { duration: 1.5 },
          rotateY: { duration: 6, repeat: Infinity, ease: "easeInOut" }
        }}
        className="relative h-64 w-64"
      >
        <svg viewBox="0 0 200 200" className="h-full w-full">
          <circle cx="100" cy="100" r={radius} fill="none" stroke="#DE3121" strokeWidth="20" opacity="0.3" />
          
          <motion.circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#DE3121"
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * 0.3 }}
            transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
            style={{ filter: "drop-shadow(0 0 10px #DE3121)" }}
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------
// SLIDE 3: Floating 3D Chat Interface & Glass Data Chips
// ---------------------------------------------------------
function Slide3AI() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center"
      style={{ perspective: 1200 }}
    >
      {/* Background Glow */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute h-[400px] w-[400px] rounded-full bg-[#DE3121] blur-[100px]"
      />

      {/* Orbiting Glass Chips */}
      <motion.div
        animate={{ y: [-15, 15, -15], rotateZ: [5, -5, 5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-8 top-1/4 flex items-center gap-2 rounded-full border border-[#DE3121]/30 bg-[#121213]/60 px-3 py-1.5 shadow-xl backdrop-blur-md"
      >
        <Lightbulb size={14} className="text-[#DE3121]" />
        <span className="text-[10px] font-semibold text-white/80">Advice</span>
      </motion.div>

      <motion.div
        animate={{ y: [15, -15, 15], rotateZ: [-5, 5, -5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-8 bottom-1/4 flex items-center gap-2 rounded-full border border-[#DE3121]/30 bg-[#121213]/60 px-3 py-1.5 shadow-xl backdrop-blur-md"
      >
        <Sparkles size={14} className="text-[#DE3121]" />
        <span className="text-[10px] font-semibold text-white/80">Insights</span>
      </motion.div>

      {/* Main Floating Chat Bubble */}
      <motion.div
        initial={{ y: 50, rotateX: 45, opacity: 0 }}
        animate={{ 
          y: [-15, 15, -15], 
          rotateX: 15,
          rotateY: [-5, 5, -5],
          opacity: 0.15 
        }}
        transition={{ 
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          rotateX: { duration: 1.5, ease: "easeOut" },
          rotateY: { duration: 1.5, ease: "easeOut" },
          opacity: { duration: 1.5 }
        }}
        className="relative flex flex-col items-start gap-3 rounded-3xl rounded-tl-sm border border-[#DE3121]/30 bg-gradient-to-br from-[#DE3121]/15 to-transparent p-5 shadow-2xl backdrop-blur-md max-w-[280px]"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#DE3121]/20">
            <Sparkles size={16} className="text-[#DE3121]" />
          </div>
          <span className="text-[12px] font-bold text-white/90">Acuity AI</span>
        </div>
        
        <p className="text-[14px] leading-relaxed text-white/70">
          Based on your current spending, you can safely spend <span className="font-bold text-[#DE3121]">₦14,800</span> this week without touching your rent.
        </p>

        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "70%" }}
            transition={{ duration: 2, delay: 0.5 }}
            className="h-full bg-[#DE3121]" 
          />
        </div>
      </motion.div>
    </motion.div>
  );
}