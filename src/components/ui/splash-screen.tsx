"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    // Lock the body from scrolling while splash is active
    const originalOverflow = document.body.style.overflow;
    const originalHeight = document.body.style.height;
    document.body.style.overflow = "hidden";
    document.body.style.height = "100dvh";

    const timer = setTimeout(() => {
      document.body.style.overflow = originalOverflow;
      document.body.style.height = originalHeight;
      onComplete();
    }, 2500);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      document.body.style.height = originalHeight;
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 h-[100dvh] w-full z-[100] flex flex-col items-center justify-center bg-[#050505] overflow-hidden">
      
      {/* TINY DENSE ACUITY DOODLE PATTERN */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* 
              A 150x150 tile that repeats infinitely. 
              This guarantees it fills every pixel of the screen.
            */}
            <pattern id="tiny-doodles" x="0" y="0" width="150" height="150" patternUnits="userSpaceOnUse">
              <g stroke="#DE3121" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                
                {/* 1. Small Acuity "A." Logo */}
                <path d="M 15 35 L 20 20 L 25 35" />
                <line x1="17" y1="30" x2="23" y2="30" />
                <circle cx="28" cy="35" r="1.2" fill="#DE3121" />

                {/* 2. Tiny Credit Card */}
                <rect x="45" y="15" width="20" height="12" rx="2" transform="rotate(-10 45 15)" />
                <line x1="47" y1="20" x2="63" y2="20" transform="rotate(-10 45 15)" strokeWidth="1" />

                {/* 3. Tiny Crown (Premium) */}
                <path d="M 85 30 L 85 22 L 88 25 L 90 20 L 92 25 L 95 22 L 95 30 Z" />

                {/* 4. AI Sparkle */}
                <path d="M 120 20 L 120 28 M 116 24 L 124 24" strokeWidth="1" />

                {/* 5. Tiny Naira Symbol */}
                <path d="M 15 75 L 15 90 M 8 80 L 22 80 M 8 85 L 22 85" strokeWidth="1.2" />

                {/* 6. Safe-to-spend Bar */}
                <rect x="45" y="75" width="25" height="5" rx="2.5" />
                <rect x="45" y="75" width="12" height="5" rx="2.5" fill="#DE3121" fillOpacity="0.5" />

                {/* 7. Tiny Trend Line */}
                <path d="M 85 85 L 90 78 L 95 88 L 100 75" />
                
                {/* 8. Smiley Face */}
                <circle cx="125" cy="80" r="6" />
                <circle cx="123" cy="78" r="0.8" fill="#DE3121" />
                <circle cx="127" cy="78" r="0.8" fill="#DE3121" />
                <path d="M 122 82 Q 125 84, 128 82" />

                {/* 9. Acuity Card */}
                <rect x="15" y="120" width="22" height="14" rx="3" transform="rotate(15 15 120)" />
                <circle cx="25" cy="128" r="1" fill="#DE3121" transform="rotate(15 15 120)" />

                {/* 10. Tiny Wifi/Analytics */}
                <path d="M 55 125 Q 60 115, 65 125" />
                <path d="M 57 130 Q 60 122, 63 130" />
                <circle cx="60" cy="134" r="1" fill="#DE3121" />

                {/* 11. Tiny Acuity "A." */}
                <path d="M 90 130 L 93 120 L 96 130" />
                <circle cx="99" cy="130" r="1" fill="#DE3121" />

                {/* 12. Tiny Star / Sparkle */}
                <path d="M 125 120 L 127 125 L 132 127 L 127 129 L 125 134 L 123 129 L 118 127 L 123 125 Z" strokeWidth="1" />

                {/* Scattered tiny dots for density */}
                <circle cx="35" cy="50" r="1" fill="#DE3121" />
                <circle cx="110" cy="50" r="1" fill="#DE3121" />
                <circle cx="70" cy="105" r="1" fill="#DE3121" />
                <circle cx="140" cy="60" r="1" fill="#DE3121" />
                <circle cx="30" cy="140" r="1" fill="#DE3121" />
                <circle cx="110" cy="145" r="1" fill="#DE3121" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tiny-doodles)" />
        </svg>
      </div>

      {/* DARK VIGNETTE OVERLAY (Keeps the logo readable) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, rgba(5,5,5,1) 0%, rgba(5,5,5,0.8) 30%, rgba(5,5,5,0.2) 70%)`
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