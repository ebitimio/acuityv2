"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { CreditCard, TrendingUp, Sparkles } from "lucide-react";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 w-full h-[100lvh] z-[100] flex flex-col items-center justify-center bg-[#050505] overflow-hidden">
      
      {/* BACKGROUND DOODLES */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Doodle 1: Credit Card (Top Left) */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [-10, -5, -10] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] left-[10%] opacity-[0.03]"
        >
          <CreditCard size={120} strokeWidth={1} />
        </motion.div>

        {/* Doodle 2: Trending Up (Bottom Right) */}
        <motion.div
          animate={{ y: [0, 15, 0], rotate: [10, 15, 10] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[20%] right-[10%] opacity-[0.03]"
        >
          <TrendingUp size={140} strokeWidth={1} />
        </motion.div>

        {/* Doodle 3: Sparkle/Coin (Top Right) */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.02, 0.04, 0.02] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[25%] right-[15%] opacity-[0.03]"
        >
          <Sparkles size={90} strokeWidth={1} />
        </motion.div>

        {/* Doodle 4: Tiny dot (Bottom Left) */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute bottom-[25%] left-[15%] opacity-[0.03]"
        >
          <div className="w-16 h-16 rounded-full border-[3px] border-white" />
        </motion.div>
      </div>

      {/* MAIN LOGO */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative z-10 flex items-baseline"
      >
        <span className="text-[52px] font-black tracking-tighter text-white drop-shadow-2xl">
          ACUITY
        </span>
        
        {/* Animated Brand Dot */}
        <motion.span 
          animate={{ 
            opacity: [0.5, 1, 0.5],
            scale: [0.95, 1.05, 0.95]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="text-[52px] font-black tracking-tighter ml-0.5 drop-shadow-2xl" 
          style={{ color: "#DE3121" }}
        >
          .
        </motion.span>
      </motion.div>

      {/* SAFE AREA FILL (Ensures the bottom is purely black) */}
      <div 
        className="absolute bottom-0 left-0 right-0 bg-[#050505]"
        style={{ height: "env(safe-area-inset-bottom, 0px)", minHeight: "1px" }} 
      />
    </div>
  );
}