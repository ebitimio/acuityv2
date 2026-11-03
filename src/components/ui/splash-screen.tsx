"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    // Reverted to inset-0 which handles iOS bottom safe areas perfectly without black bars
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0b0b0c] overflow-hidden">
      
      {/* 
        BACKGROUND DOODLES 
        We use an SVG pattern to create a seamless, high-quality doodle background.
      */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.15]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="app-doodles" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <g stroke="#DE3121" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                {/* Credit Card */}
                <rect x="20" y="20" width="40" height="26" rx="4" transform="rotate(-15 20 20)" />
                <line x1="22" y1="30" x2="58" y2="30" transform="rotate(-15 20 20)" />
                
                {/* Chart Bar / Trend */}
                <path d="M 150 50 L 150 80 M 160 40 L 160 80 M 170 60 L 170 80" />
                <path d="M 140 70 L 180 30" strokeDasharray="2 4" />
                
                {/* Coin / Dollar Sign */}
                <circle cx="50" cy="150" r="12" />
                <path d="M 47 145 L 53 145 M 50 142 L 50 158 M 47 155 L 53 155" />
                
                {/* Sparkle / AI */}
                <path d="M 150 140 L 150 160 M 140 150 L 160 150" />
                <path d="M 145 145 L 155 155 M 145 155 L 155 145" strokeWidth="1" />

                {/* Wavy Line (Data/Analytics) */}
                <path d="M 10 100 Q 25 80, 40 100 T 70 100" />

                {/* Tiny dots and stars for filler */}
                <circle cx="100" cy="20" r="2" fill="#DE3121" />
                <circle cx="180" cy="100" r="2" fill="#DE3121" />
                <circle cx="20" cy="180" r="2" fill="#DE3121" />
                <path d="M 90 100 L 95 95 M 95 100 L 90 95" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#app-doodles)" />
        </svg>
      </div>

      {/* DARK GRADIENT OVERLAY (To ensure the doodles don't overpower the logo) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, rgba(11,11,12,0.6) 0%, rgba(11,11,12,1) 70%)`
        }}
      />

      {/* MAIN LOGO & PULSING DOT */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative z-10 flex items-baseline"
      >
        <span className="text-[48px] font-black tracking-tighter text-white drop-shadow-xl">
          ACUITY
        </span>
        
        <motion.span 
          animate={{ 
            opacity: [0.4, 1, 0.4],
            scale: [0.95, 1.05, 0.95]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="text-[48px] font-black tracking-tighter ml-0.5 drop-shadow-xl" 
          style={{ color: "#DE3121" }}
        >
          .
        </motion.span>
      </motion.div>

    </div>
  );
}