"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, TrendingUp, Bell, PiggyBank, LineChart, Eye, ChevronDown } from "lucide-react";

const SLIDES = [
  {
    id: 0,
    subtitle: "01 — Welcome",
    title: "Welcome to\nAcuity.",
    desc: "A clearer way to move forward.",
  },
  {
    id: 1,
    subtitle: "02 — Intelligence",
    title: "Your Personal\nFinancial Officer.\nPowered by AI.",
    desc: "Get real-time insights, smart spending alerts, personalised advice and automated tracking — all tailored to your goals.",
  },
  {
    id: 2,
    subtitle: "03 — Security",
    title: "Better Money.\nBrighter Futures.",
    desc: "Take control of your finances today. Let Acuity be your guide, your tracker, and your personal Financial Officer.",
  },
  {
    id: 3,
    subtitle: "04 — Clarity",
    title: "Your Future\nDeserves Clarity.",
    desc: "Everything you need to manage your wealth, thoughtfully designed.",
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
      
      {/* Background Graphics that change per slide */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex flex-col justify-center items-center">
        <AnimatePresence mode="wait">
          {current === 0 && <Slide1Mockup key="g1" />}
          {current === 1 && <Slide2Graphic key="g2" />}
          {current === 2 && <Slide3Graphic key="g3" />}
          {current === 3 && <Slide4Graphic key="g4" />}
        </AnimatePresence>
      </div>

      {/* Header */}
      <div className="relative z-10 px-8 pt-[calc(env(safe-area-inset-top)+24px)]">
        <div className="flex items-baseline">
          <span className="text-[28px] font-black tracking-tighter text-white">ACUITY</span>
          <span className="text-[28px] font-black tracking-tighter" style={{ color: "var(--brand)" }}>.</span>
        </div>
      </div>

      {/* Text Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-end px-8 pb-[calc(env(safe-area-inset-bottom)+120px)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-sm"
          >
            <p className="text-[13px] font-mono tracking-widest text-[var(--brand)] mb-4 uppercase">
              {SLIDES[current].subtitle}
            </p>
            <h1 className="text-[42px] font-bold leading-[1.05] tracking-tight whitespace-pre-line mb-4">
              {SLIDES[current].title}
            </h1>
            <p className="text-[15px] text-white/60 leading-relaxed">
              {SLIDES[current].desc}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer: Dots & Button */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-8 pb-[calc(env(safe-area-inset-bottom)+32px)] pt-4 bg-gradient-to-t from-[#0b0b0c] via-[#0b0b0c]/80 to-transparent">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {SLIDES.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current ? "w-6 bg-[var(--brand)]" : "w-2 bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={next}
          className="flex w-full h-14 items-center justify-center gap-2 rounded-full font-bold text-[16px] text-black active:scale-95 transition-transform bg-white"
        >
          Get Started
          <ArrowRight size={18} strokeWidth={2.5} style={{ color: "var(--brand)" }} />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// GRAPHIC 1: Floating Phone Mockup with Dashboard
// ---------------------------------------------------------
function Slide1Mockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full h-[55vh] flex items-center justify-center mt-[-5vh]"
    >
      {/* Glow behind the phone */}
      <div className="absolute w-64 h-64 bg-[var(--brand)]/20 blur-[80px] rounded-full" />

      {/* Phone Frame */}
      <div className="relative w-[260px] h-[540px] rounded-[40px] border-[6px] border-[#222] bg-[#0b0b0c] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Notch */}
        <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-20">
          <div className="w-24 h-6 bg-[#222] rounded-b-xl" />
        </div>

        {/* Status Bar */}
        <div className="flex justify-between items-center px-5 pt-8 pb-2 text-[10px] font-semibold text-white">
          <span>12:28</span>
          <div className="flex gap-1 items-center">
            <div className="w-3 h-2 bg-white rounded-sm" />
            <div className="w-2 h-2 bg-white rounded-full" />
            <div className="w-3 h-2 bg-white rounded-sm" />
          </div>
        </div>

        {/* App Content Mockup */}
        <div className="flex-1 px-4 flex flex-col gap-3 overflow-hidden">
          
          {/* Header */}
          <div className="flex justify-between items-center mt-2">
            <span className="text-[14px] font-bold text-white flex items-center gap-1">
              Personal Workspace <ChevronDown size={12} className="text-white/50" />
            </span>
            <div className="flex gap-1">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center"><Bell size={10} className="text-white" /></div>
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-bold text-white">E</div>
            </div>
          </div>

          {/* Hero Card */}
          <div className="rounded-[16px] p-3 text-black relative" style={{ background: "var(--brand)" }}>
            <p className="text-center text-[8px] font-semibold text-black/70">October 2026</p>
            <p className="text-[8px] text-black/70 mt-1">Net across accounts</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[18px] font-bold leading-none tracking-tight">₦60,714,465</span>
              <div className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center"><Eye size={8} className="text-black/70" /></div>
            </div>
            <p className="text-[7px] text-black/70 mt-1">₦219,500 spent this month</p>
            
            <div className="mt-2 flex items-center justify-between rounded-md bg-black px-2 py-1">
              <span className="text-[6px] font-medium text-white">Safe to spend today</span>
              <span className="text-[8px] font-bold text-white">₦69,200</span>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <p className="text-[6px] text-black/70">Income</p>
                <p className="text-[8px] font-semibold text-[#22c55e]">₦69,200</p>
              </div>
              <div>
                <p className="text-[6px] text-black/70">Net liquid assets</p>
                <p className="text-[8px] font-semibold text-black">₦643,000</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-2">
            <div className="h-8 rounded-lg bg-[#1c1c1e] border border-white/5 flex items-center justify-center">
              <PiggyBank size={12} color="var(--brand)" />
            </div>
            <div className="h-8 rounded-lg bg-[#1c1c1e] border border-white/5 flex items-center justify-center">
              <TrendingUp size={12} color="var(--brand)" />
            </div>
            <div className="h-8 rounded-lg bg-[#1c1c1e] border border-white/5 flex items-center justify-center">
              <ArrowRight size={12} color="var(--brand)" />
            </div>
          </div>

          {/* Accounts Section */}
          <div className="mt-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[8px] font-semibold text-white">My Accounts</span>
              <span className="text-[7px] text-[var(--brand)]">See all</span>
            </div>
            {/* Mini ATM Card */}
            <div className="rounded-xl border border-[var(--brand)]/30 bg-gradient-to-br from-[#1c1c1e] to-[#0b0b0c] p-2 relative overflow-hidden">
              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-[var(--brand)]/20 flex items-center justify-center text-[8px] font-bold text-[var(--brand)]">M</div>
                  <div>
                    <p className="text-[8px] font-bold text-[var(--brand)]">Main</p>
                    <p className="text-[6px] text-[var(--brand)]/60 uppercase">Checking</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[5px] uppercase tracking-widest text-[var(--brand)]/60">Cardholder</p>
                  <p className="text-[7px] font-mono tracking-wider text-[var(--brand)]">EBITIMI OGLAFA</p>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-end relative z-10">
                <div>
                  <p className="text-[5px] text-[var(--brand)]/60">Balance</p>
                  <p className="text-[10px] font-bold text-[var(--brand)]">₦193,000</p>
                </div>
                <p className="text-[6px] text-[var(--brand)]/80">Kuda bank</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Nav Mockup */}
        <div className="h-12 bg-[#1c1c1e] mt-auto flex items-center justify-around px-4 rounded-b-[34px]">
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full" /></div>
          <div className="w-2 h-2 bg-white/30 rounded-full" />
          <div className="w-2 h-2 bg-white/30 rounded-full" />
          <div className="w-2 h-2 bg-white/30 rounded-full" />
          <div className="w-6 h-6 rounded-full bg-[var(--brand)] flex items-center justify-center text-black font-bold text-[10px]">+</div>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------
// GRAPHIC 2: The Glowing AI Orb with floating widgets
// ---------------------------------------------------------
function Slide2Graphic() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.8 }}
      className="relative w-full h-[50vh] flex items-center justify-center mt-[-10vh]"
    >
      <div className="absolute w-64 h-64 rounded-full border border-[var(--brand)]/30 shadow-[0_0_60px_rgba(222,49,33,0.2)]" />
      <div className="absolute w-48 h-48 rounded-full border border-[var(--brand)]/50 shadow-[0_0_40px_rgba(222,49,33,0.4)]" />
      
      <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-[#2a2a2c] to-black shadow-[inset_0_0_20px_rgba(255,255,255,0.1),0_0_30px_rgba(222,49,33,0.3)] flex items-center justify-center">
        <span className="text-[40px] font-black text-white">A<span style={{ color: "var(--brand)" }}>.</span></span>
      </div>

      <motion.div 
        animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] left-[5%] p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md"
      >
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={12} className="text-[var(--brand)]" />
          <span className="text-[10px] font-semibold text-white">Spending Analysis</span>
        </div>
        <p className="text-[8px] text-white/50">You're spending 23% more on dining this month.</p>
      </motion.div>

      <motion.div 
        animate={{ y: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[15%] right-[5%] p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md"
      >
        <div className="flex items-center gap-2 mb-1">
          <Bell size={12} className="text-[var(--brand)]" />
          <span className="text-[10px] font-semibold text-white">Smart Alerts</span>
        </div>
        <p className="text-[8px] text-white/50">Large transaction detected on your card.</p>
      </motion.div>

      <motion.div 
        animate={{ y: [0, -8, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[15%] left-[5%] p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md"
      >
        <div className="flex items-center gap-2 mb-1">
          <PiggyBank size={12} className="text-[var(--brand)]" />
          <span className="text-[10px] font-semibold text-white">Savings Suggestion</span>
        </div>
        <p className="text-[8px] text-white/50">You could save ₦120,000 more monthly.</p>
      </motion.div>

      <motion.div 
        animate={{ y: [0, 12, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[20%] right-[5%] p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md"
      >
        <div className="flex items-center gap-2 mb-1">
          <LineChart size={12} className="text-[var(--brand)]" />
          <span className="text-[10px] font-semibold text-white">Investment Insights</span>
        </div>
        <p className="text-[8px] text-white/50">Your portfolio is up 8.4% this month.</p>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------
// GRAPHIC 3: Red Sun over Mountains
// ---------------------------------------------------------
function Slide3Graphic() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8 }}
      className="relative w-full h-[60vh] flex flex-col items-center justify-end mt-[-10vh]"
    >
      <div className="absolute top-[10%] w-48 h-48 rounded-full border-4 border-[var(--brand)] shadow-[0_0_50px_rgba(222,49,33,0.6),inset_0_0_40px_rgba(222,49,33,0.4)]" />
      
      <div className="relative w-full h-[40%] overflow-hidden">
        <div 
          className="absolute bottom-0 left-[-10%] w-[70%] h-full bg-[#111]"
          style={{ clipPath: "polygon(0 100%, 50% 0, 100% 100%)" }}
        />
        <div 
          className="absolute bottom-0 right-[-10%] w-[70%] h-full bg-[#151515]"
          style={{ clipPath: "polygon(0 100%, 50% 0, 100% 100%)" }}
        />
        
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[40%] h-full bg-gradient-to-t from-[var(--brand)] to-transparent opacity-60"
          style={{ clipPath: "polygon(40% 100%, 60% 100%, 55% 0, 45% 0)" }}
        />
        
        <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-[#0b0b0c] to-transparent z-10" />
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------
// GRAPHIC 4: Simple Abstract Glow
// ---------------------------------------------------------
function Slide4Graphic() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="relative w-full h-[50vh] flex items-center justify-center mt-[-10vh]"
    >
      <div className="absolute w-72 h-72 rounded-full bg-[var(--brand)]/10 blur-[80px]" />
      <div className="absolute w-40 h-40 rounded-full bg-[var(--brand)]/20 blur-[40px]" />
      <div className="relative text-[120px] font-black tracking-tighter text-white/5">
        A.
      </div>
    </motion.div>
  );
}