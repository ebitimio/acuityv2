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
    <div className="fixed inset-0 z-[200] flex flex-col bg-[#0b0b0c] text-white overflow-hidden">
      
      {/* Animated Backgrounds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <AnimatePresence mode="wait">
          {current === 0 && <Slide1Plane key="s1" />}
          {current === 1 && <Slide2Chart key="s2" />}
          {current === 2 && <Slide3AI key="s3" />}
        </AnimatePresence>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center relative z-10">
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
// SLIDE 1: Airplane flying with dashed trail
// ---------------------------------------------------------
function Slide1Plane() {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 400 800"
      preserveAspectRatio="none"
    >
      {/* Dashed Trail */}
      <motion.path
        d="M -50 850 Q 150 500 450 200"
        fill="none"
        stroke="#DE3121"
        strokeWidth="2"
        strokeDasharray="8 8"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.4 }}
        transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
      />
      {/* Airplane Icon following the path */}
      <motion.g
        initial={{ offsetDistance: "0%", opacity: 0 }}
        animate={{ offsetDistance: "100%", opacity: 0.15 }}
        transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
        style={{ 
          offsetPath: 'path("M -50 850 Q 150 500 450 200")',
          offsetRotate: "auto 90deg" 
        }}
      >
        <path 
          d="M 21 16 L 21 10 C 21 8.895 20.105 8 19 8 C 17.895 8 17 8.895 17 10 L 17 16 L 11 16 L 9 13 L 7 13 L 8 18 L 7 23 L 9 23 L 11 20 L 17 20 L 17 26 C 17 27.105 17.895 28 19 28 C 20.105 28 21 27.105 21 26 L 21 20 L 27 20 L 29 23 L 31 23 L 30 18 L 31 13 L 29 13 L 27 16 Z" 
          fill="#DE3121"
          transform="scale(2) translate(-10, -10)"
        />
      </motion.g>
    </motion.svg>
  );
}

// ---------------------------------------------------------
// SLIDE 2: Bar chart growing + Line tracing
// ---------------------------------------------------------
function Slide2Chart() {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 400 800"
      preserveAspectRatio="none"
    >
      {/* Growing Bars */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.rect
          key={i}
          x={50 + i * 70}
          width="40"
          rx="8"
          fill="#DE3121"
          initial={{ height: 0, y: 800, opacity: 0 }}
          animate={{ 
            height: [0, 100 + i * 60], 
            y: [800, 800 - (100 + i * 60)],
            opacity: 0.1 
          }}
          transition={{ 
            duration: 1.5, 
            delay: i * 0.15, 
            ease: "easeOut",
            repeat: Infinity,
            repeatType: "reverse",
            repeatDelay: 1
          }}
        />
      ))}
      
      {/* Tracing Line */}
      <motion.path
        d="M 50 750 L 120 700 L 190 600 L 260 500 L 330 350"
        fill="none"
        stroke="#DE3121"
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.3 }}
        transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
      />
    </motion.svg>
  );
}

// ---------------------------------------------------------
// SLIDE 3: AI Network connecting nodes
// ---------------------------------------------------------
function Slide3AI() {
  const nodes = [
    { x: 100, y: 200 },
    { x: 300, y: 250 },
    { x: 150, y: 500 },
    { x: 350, y: 550 },
    { x: 200, y: 700 },
  ];

  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 400 800"
      preserveAspectRatio="none"
    >
      {/* Connecting Lines */}
      {nodes.map((node, i) => (
        <motion.line
          key={`line-${i}`}
          x1="200" y1="400"
          x2={node.x} y2={node.y}
          stroke="#DE3121"
          strokeWidth="2"
          strokeDasharray="4 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.2 }}
          transition={{ duration: 1.5, delay: i * 0.2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
        />
      ))}

      {/* Central AI Node */}
      <motion.circle
        cx="200" cy="400" r="30"
        fill="#DE3121"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: [1, 1.2, 1], opacity: 0.2 }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Orbiting Nodes */}
      {nodes.map((node, i) => (
        <motion.circle
          key={`node-${i}`}
          cx={node.x} cy={node.y} r="12"
          fill="#0b0b0c"
          stroke="#DE3121"
          strokeWidth="3"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ duration: 0.5, delay: i * 0.2, ease: "backOut", repeat: Infinity, repeatType: "reverse", repeatDelay: 1 }}
        />
      ))}
    </motion.svg>
  );
}