"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    // EXACT LOGIC: fixed inset-0, NO overflow-hidden, fills to the physical bottom
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0a]">
      
      {/* BRANDED ACUITY DOODLE PATTERN */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="acuity-doodles" x="0" y="0" width="400" height="400" patternUnits="userSpaceOnUse">
              <g stroke="#DE3121" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                
                {/* --- ROW 1 --- */}
                {/* Acuity Card */}
                <rect x="20" y="20" width="55" height="35" rx="6" transform="rotate(-15 20 20)" />
                <circle cx="45" cy="35" r="3" fill="#DE3121" transform="rotate(-15 20 20)" />
                <path d="M 25 25 L 35 25" transform="rotate(-15 20 20)" strokeWidth="1.5" />
                
                {/* Large Acuity "A." */}
                <path d="M 110 45 L 120 15 L 130 45" />
                <line x1="113" y1="35" x2="127" y2="35" />
                <circle cx="135" cy="45" r="2.5" fill="#DE3121" />

                {/* Naira Symbol */}
                <path d="M 170 20 L 170 50 M 160 30 L 180 30 M 160 40 L 180 40" />

                {/* Crown (Premium) */}
                <path d="M 210 45 L 210 30 L 215 35 L 220 25 L 225 35 L 230 30 L 230 45 Z" />
                
                {/* Safe-to-spend Bar */}
                <rect x="260" y="20" width="70" height="10" rx="5" />
                <rect x="260" y="20" width="40" height="10" rx="5" fill="#DE3121" fillOpacity="0.4" />

                {/* AI Sparkle */}
                <path d="M 350 30 L 350 50 M 340 40 L 360 40" />
                <path d="M 345 35 L 355 45 M 345 45 L 355 35" strokeWidth="1" />


                {/* --- ROW 2 --- */}
                {/* Bell Icon */}
                <path d="M 40 90 Q 40 75 50 75 Q 60 75 60 90 L 65 100 L 35 100 Z" />
                <circle cx="50" cy="105" r="3" fill="#DE3121" />

                {/* Another Acuity Card */}
                <rect x="100" y="90" width="55" height="35" rx="6" transform="rotate(10 100 90)" />
                <path d="M 110 105 L 130 105" transform="rotate(10 100 90)" strokeWidth="1" />
                <circle cx="140" cy="115" r="2" fill="#DE3121" transform="rotate(10 100 90)" />

                {/* Smiley Face (AI/Human element) */}
                <circle cx="200" cy="105" r="15" />
                <circle cx="195" cy="100" r="1.5" fill="#DE3121" />
                <circle cx="205" cy="100" r="1.5" fill="#DE3121" />
                <path d="M 192 110 Q 200 118, 208 110" />

                {/* Trend Line */}
                <path d="M 250 120 Q 270 80, 290 110 T 330 90" />
                <path d="M 325 85 L 330 90 L 325 95" />
                <circle cx="270" cy="100" r="2" fill="#DE3121" />

                {/* Tiny Acuity "A." */}
                <path d="M 370 95 L 375 80 L 380 95" />
                <circle cx="385" cy="95" r="1.5" fill="#DE3121" />


                {/* --- ROW 3 --- */}
                {/* Naira Symbol 2 */}
                <path d="M 20 180 L 20 210 M 10 190 L 30 190 M 10 200 L 30 200" strokeWidth="1.5" />

                {/* AI Sparkles */}
                <path d="M 70 190 L 70 205 M 62.5 197.5 L 77.5 197.5" strokeWidth="1" />
                <path d="M 90 220 L 90 230 M 85 225 L 95 225" strokeWidth="1" />

                {/* Acuity Card 3 */}
                <rect x="120" y="180" width="45" height="28" rx="5" transform="rotate(-5 120 180)" />
                <circle cx="140" cy="195" r="2" fill="#DE3121" transform="rotate(-5 120 180)" />

                {/* Zigzag (Volatility) */}
                <path d="M 180 200 L 190 185 L 200 215 L 210 190 L 220 210" />

                {/* Large Acuity "A." */}
                <path d="M 260 210 L 275 170 L 290 210" />
                <line x1="266" y1="198" x2="284" y2="198" />
                <circle cx="298" cy="210" r="2.5" fill="#DE3121" />

                {/* Another Safe-to-spend Bar */}
                <rect x="320" y="190" width="60" height="8" rx="4" />
                <rect x="320" y="190" width="30" height="8" rx="4" fill="#DE3121" fillOpacity="0.4" />


                {/* --- ROW 4 --- */}
                {/* Acuity Card 4 */}
                <rect x="30" y="270" width="55" height="35" rx="6" transform="rotate(15 30 270)" />
                <path d="M 45 285 L 65 285" transform="rotate(15 30 270)" strokeWidth="1" />
                
                {/* Naira Symbol 3 */}
                <path d="M 110 280 L 110 305 M 100 290 L 120 290 M 100 298 L 120 298" strokeWidth="1.5" />

                {/* Crown 2 */}
                <path d="M 150 300 L 150 285 L 155 290 L 160 280 L 165 290 L 170 285 L 170 300 Z" />

                {/* Acuity Card 5 */}
                <rect x="200" y="270" width="50" height="30" rx="5" transform="rotate(-10 200 270)" />
                <circle cx="220" cy="285" r="2" fill="#DE3121" transform="rotate(-10 200 270)" />

                {/* Bell Icon 2 */}
                <path d="M 270 280 Q 270 265 280 265 Q 290 265 290 280 L 295 290 L 265 290 Z" />
                <circle cx="280" cy="295" r="3" fill="#DE3121" />

                {/* AI Sparkle 3 */}
                <path d="M 330 280 L 330 300 M 320 290 L 340 290" />
                <path d="M 325 285 L 335 295 M 325 295 L 335 285" strokeWidth="1" />

                {/* Tiny Dots */}
                <circle cx="370" cy="270" r="1.5" fill="#DE3121" />
                <circle cx="385" cy="300" r="1.5" fill="#DE3121" />


                {/* --- SCATTERED FILLERS --- */}
                <circle cx="80" cy="60" r="2" fill="#DE3121" />
                <circle cx="180" cy="140" r="2" fill="#DE3121" />
                <circle cx="310" cy="130" r="2" fill="#DE3121" />
                <circle cx="40" cy="230" r="2" fill="#DE3121" />
                <circle cx="160" cy="240" r="2" fill="#DE3121" />
                <circle cx="360" cy="230" r="2" fill="#DE3121" />
                <circle cx="90" cy="340" r="2" fill="#DE3121" />
                <circle cx="250" cy="330" r="2" fill="#DE3121" />
                <circle cx="340" cy="340" r="2" fill="#DE3121" />

                <path d="M 140 80 L 145 85 M 145 80 L 140 85" strokeWidth="1" />
                <path d="M 280 220 L 285 225 M 285 220 L 280 225" strokeWidth="1" />
                <path d="M 30 330 L 35 335 M 35 330 L 30 335" strokeWidth="1" />

              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#acuity-doodles)" />
        </svg>
      </div>

      {/* 
        DARK VIGNETTE OVERLAY 
        Fades the doodles in the center so the logo is perfectly readable.
        Reduced opacity slightly so the doodles are more visible.
      */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.6) 40%, rgba(10,10,10,0.1) 100%)`
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