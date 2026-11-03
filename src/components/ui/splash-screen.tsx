"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    // EXACT LOGIC FROM YOUR OLD CODE: fixed inset-0, NO overflow-hidden
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0a]">
      
      {/* BRANDED ACUITY DOODLE PATTERN */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="acuity-doodles" x="0" y="0" width="350" height="350" patternUnits="userSpaceOnUse">
              <g stroke="#DE3121" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                
                {/* --- TOP LEFT --- */}
                <rect x="20" y="20" width="55" height="35" rx="6" transform="rotate(-15 20 20)" />
                <circle cx="45" cy="35" r="3" fill="#DE3121" transform="rotate(-15 20 20)" />
                <path d="M 25 25 L 35 25" transform="rotate(-15 20 20)" strokeWidth="1.5" />
                
                <path d="M 100 40 L 110 15 L 120 40" />
                <line x1="103" y1="32" x2="117" y2="32" />
                <circle cx="125" cy="40" r="2" fill="#DE3121" />

                <path d="M 170 20 L 170 45 M 160 30 L 180 30 M 160 38 L 180 38" />

                <rect x="220" y="20" width="60" height="10" rx="5" />
                <rect x="220" y="20" width="35" height="10" rx="5" fill="#DE3121" fillOpacity="0.4" />

                <path d="M 300 30 L 300 45 M 292.5 37.5 L 307.5 37.5" />
                <path d="M 295 32.5 L 305 42.5 M 295 42.5 L 305 32.5" strokeWidth="1" />

                {/* --- MIDDLE LEFT --- */}
                <rect x="30" y="120" width="55" height="35" rx="6" transform="rotate(10 30 120)" />
                <path d="M 40 135 L 60 135" transform="rotate(10 30 120)" strokeWidth="1" />
                <circle cx="70" cy="145" r="2" fill="#DE3121" transform="rotate(10 30 120)" />

                <path d="M 120 130 L 125 115 L 130 130" />
                <circle cx="135" cy="130" r="1.5" fill="#DE3121" />

                {/* --- MIDDLE CENTER --- */}
                <path d="M 150 180 Q 170 140, 190 170 T 230 150" />
                <path d="M 225 145 L 230 150 L 225 155" />
                <circle cx="170" cy="160" r="2" fill="#DE3121" />

                <path d="M 270 160 L 270 175 M 262.5 167.5 L 277.5 167.5" strokeWidth="1" />
                <path d="M 290 190 L 290 200 M 285 195 L 295 195" strokeWidth="1" />

                {/* --- MIDDLE RIGHT --- */}
                <path d="M 310 120 L 310 145 M 300 130 L 320 130 M 300 138 L 320 138" />
                
                <circle cx="280" cy="100" r="1.5" fill="#DE3121" />
                <circle cx="290" cy="100" r="1.5" fill="#DE3121" />
                <circle cx="300" cy="100" r="1.5" fill="#DE3121" />

                {/* --- BOTTOM LEFT --- */}
                <path d="M 40 260 L 55 220 L 70 260" />
                <line x1="46" y1="248" x2="64" y2="248" />
                <circle cx="78" cy="260" r="2.5" fill="#DE3121" />

                <rect x="100" y="240" width="50" height="8" rx="4" />
                <rect x="100" y="240" width="25" height="8" rx="4" fill="#DE3121" fillOpacity="0.4" />

                {/* --- BOTTOM CENTER --- */}
                <rect x="180" y="250" width="45" height="28" rx="5" transform="rotate(-5 180 250)" />
                <circle cx="200" cy="265" r="2" fill="#DE3121" transform="rotate(-5 180 250)" />

                <path d="M 130 290 L 140 280 L 150 290 L 160 280 L 170 290" />

                {/* --- BOTTOM RIGHT --- */}
                <rect x="260" y="240" width="55" height="35" rx="6" transform="rotate(15 260 240)" />
                <path d="M 275 255 L 295 255" transform="rotate(15 260 240)" strokeWidth="1" />
                
                <path d="M 310 290 L 310 315 M 300 300 L 320 300 M 300 308 L 320 308" strokeWidth="1.5" />

                {/* --- SCATTERED FILLERS --- */}
                <circle cx="80" cy="80" r="2" fill="#DE3121" />
                <circle cx="180" cy="80" r="2" fill="#DE3121" />
                <circle cx="260" cy="60" r="2" fill="#DE3121" />
                <circle cx="20" cy="180" r="2" fill="#DE3121" />
                <circle cx="320" cy="200" r="2" fill="#DE3121" />
                <circle cx="80" cy="310" r="2" fill="#DE3121" />
                <circle cx="220" cy="320" r="2" fill="#DE3121" />
                <circle cx="340" cy="300" r="2" fill="#DE3121" />

                <path d="M 140 50 L 145 55 M 145 50 L 140 55" strokeWidth="1" />
                <path d="M 240 220 L 245 225 M 245 220 L 240 225" strokeWidth="1" />
                <path d="M 10 280 L 15 285 M 15 280 L 10 285" strokeWidth="1" />

              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#acuity-doodles)" />
        </svg>
      </div>

      {/* DARK VIGNETTE OVERLAY */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.7) 40%, rgba(10,10,10,0.2) 100%)`
        }}
      />

      {/* MAIN LOGO */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative z-10 flex items-baseline"
      >
        <span className="text-[48px] font-black tracking-tighter text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
          ACUITY
        </span>
        
        {/* Pulsing Brand Dot */}
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
          className="text-[48px] font-black tracking-tighter ml-0.5 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]" 
          style={{ color: "#DE3121" }}
        >
          .
        </motion.span>
      </motion.div>

    </div>
  );
}