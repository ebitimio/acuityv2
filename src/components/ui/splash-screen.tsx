"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 w-full h-[100lvh] z-[100] flex flex-col items-center justify-center bg-[#050505] overflow-hidden">
      
      {/* BACKGROUND GRADIENT (Darker & fills entirely) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 10% 10%, rgba(40, 20, 60, 0.15) 0%, transparent 60%),
            radial-gradient(circle at 90% 90%, rgba(60, 15, 25, 0.15) 0%, transparent 60%),
            radial-gradient(circle at 50% 50%, rgba(10, 10, 20, 0.05) 0%, transparent 70%),
            linear-gradient(to bottom, rgba(5,5,5,0) 70%, rgba(5,5,5,1) 100%)
          `
        }}
      />

      {/* NOISE TEXTURE OVERLAY */}
      <div 
        className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

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

      {/* THE FIX: A physical black block at the bottom to force iOS to paint the safe area */}
      <div 
        className="absolute bottom-0 left-0 right-0 bg-[#050505]"
        style={{ height: "env(safe-area-inset-bottom, 0px)", minHeight: "1px" }} 
      />
    </div>
  );
}