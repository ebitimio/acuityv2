"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] overflow-hidden">
      
      {/* BACKGROUND GRADIENT (Inspired by Payropp) */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background: `
            radial-gradient(circle at 10% 10%, rgba(40, 20, 60, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 90% 80%, rgba(80, 20, 30, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 50% 100%, rgba(20, 20, 40, 0.5) 0%, transparent 60%)
          `
        }}
      />

      {/* NOISE TEXTURE OVERLAY (For the cinematic look) */}
      <div 
        className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* MAIN LOGO & ANIMATION */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="flex items-baseline">
          <span className="text-[52px] font-black tracking-tighter text-white">
            ACUITY
          </span>
          
          {/* Animated Brand Dot */}
          <motion.span 
            animate={{ 
              opacity: [0.3, 1, 0.3],
              scale: [0.95, 1.05, 0.95]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="text-[52px] font-black tracking-tighter ml-0.5" 
            style={{ color: "#DE3121" }}
          >
            .
          </motion.span>
        </div>

        {/* Minimalist Loading Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 flex gap-1.5"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                backgroundColor: ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.8)", "rgba(255,255,255,0.1)"] 
              }}
              transition={{ 
                duration: 1.2, 
                repeat: Infinity, 
                delay: i * 0.2,
                ease: "easeInOut"
              }}
              className="w-1.5 h-1.5 rounded-full"
            />
          ))}
        </motion.div>
      </motion.div>

    </div>
  );
}