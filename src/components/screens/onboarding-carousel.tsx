"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, TrendingUp, Bell, LineChart } from "lucide-react";

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
    <div className="fixed inset-0 z-[200] flex flex-col justify-between bg-[#0b0b0c] text-white overflow-hidden">
      
      {/* Background Graphics */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex flex-col justify-center items-center">
        <AnimatePresence mode="wait">
          {current === 0 && <Slide1Graphic key="g1" />}
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

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col justify-end px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-sm mb-4" 
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

      {/* Footer: Dots & Button - Pushed to the absolute bottom */}
      <div className="relative z-10 px-8 pb-[calc(env(safe-area-inset-bottom)+32px)] pt-4 bg-gradient-to-t from-[#0b0b0c] via-[#0b0b0c]/90 to-transparent">
        <div className="flex items-center mb-6">
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
// GRAPHIC 1: Dogtag Image
// ---------------------------------------------------------
function Slide1Graphic() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8 }}
      className="relative w-full h-[65vh] flex items-center justify-center mt-[-15vh] overflow-hidden"
    >
      <img 
        src="/dogtag.png" 
        alt="Acuity Dogtag" 
        className="w-full h-full object-cover opacity-90"
        style={{ 
          filter: "brightness(0.8) contrast(1.2)",
          maskImage: "radial-gradient(circle, black 40%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(circle, black 40%, transparent 80%)"
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0c] via-[#0b0b0c]/50 to-transparent" />
    </motion.div>
  );
}

// ---------------------------------------------------------
// GRAPHIC 2: Glowing AI Orb
// ---------------------------------------------------------
function Slide2Graphic() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.8 }}
      className="relative w-full h-[50vh] flex items-center justify-center mt-[-20vh]"
    >
      <div className="absolute w-64 h-64 rounded-full border border-[var(--brand)]/30 shadow-[0_0_60px_rgba(222,49,33,0.2)]" />
      <div className="absolute w-48 h-48 rounded-full border border-[var(--brand)]/50 shadow-[0_0_40px_rgba(222,49,33,0.4)]" />
      
      <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-[#2a2a2c] to-black shadow-[inset_0_0_20px_rgba(255,255,255,0.1),0_0_30px_rgba(222,49,33,0.3)] flex items-center justify-center">
        <span className="text-[40px] font-black text-white">A<span style={{ color: "var(--brand)" }}>.</span></span>
      </div>

      <motion.div 
        animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[5%] left-[5%] p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md scale-90"
      >
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={10} className="text-[var(--brand)]" />
          <span className="text-[9px] font-semibold text-white">Spending Analysis</span>
        </div>
        <p className="text-[7px] text-white/50">You're spending 23% more on dining this month.</p>
      </motion.div>

      <motion.div 
        animate={{ y: [0, 8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] right-[5%] p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md scale-90"
      >
        <div className="flex items-center gap-2 mb-1">
          <Bell size={10} className="text-[var(--brand)]" />
          <span className="text-[9px] font-semibold text-white">Smart Alerts</span>
        </div>
        <p className="text-[7px] text-white/50">Large transaction detected.</p>
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