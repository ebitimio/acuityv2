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
      // Restore body styles before completing
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
    <div className="fixed inset-0 h-[100dvh] w-full z-[100] flex flex-col items-center justify-center bg-black overflow-hidden">
      
      {/* 
        GENERATED DOODLE BACKGROUND 
        Uses your exact layout but with Acuity brand colors (#DE3121)
      */}
      <div className="absolute inset-0 pointer-events-none">
        <svg 
          className="w-full h-full block" 
          viewBox="0 0 400 860" 
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DE3121"/>
              <stop offset="100%" stopColor="#A81D13"/>
            </linearGradient>
          </defs>

          {/* Background color */}
          <rect x="0" y="0" width="100%" height="100%" fill="#000000"/>

          {/* Group containing all generated minimalist doodles */}
          <g className="animate-doodle">
            
            {/* Top Left Dot */}
            <g transform="translate(43, 54) rotate(17.8, 4, 4) scale(1.15)" opacity="0.34">
              <circle cx="4" cy="4" r="2.5" fill="#DE3121"/>
            </g>
            
            {/* Top Center Bell */}
            <g transform="translate(102, 39) rotate(9.4, 20, 18) scale(1.00)" opacity="0.32">
              <g stroke="#DE3121" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 4 C 18 2, 22 2, 22 4 C 28 6, 32 12, 32 20 L 34 26 L 6 26 L 8 20 C 8 12, 12 6, 18 4 Z"/>
                <path d="M16 29 C 16 31.5, 18 33, 20 33 C 22 33, 24 31.5, 24 29"/>
              </g>
            </g>

            {/* Top Right Crown */}
            <g transform="translate(148, 7) rotate(-3.2, 24, 16) scale(0.98)" opacity="0.31">
              <g stroke="#DE3121" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 26 L4 10 L16 18 L24 6 L32 18 L44 10 L44 26 Z"/>
                <circle cx="4" cy="9" r="1.5" fill="#DE3121"/>
                <circle cx="24" cy="5" r="1.5" fill="#DE3121"/>
                <circle cx="44" cy="9" r="1.5" fill="#DE3121"/>
              </g>
            </g>

            {/* Acuity 'A.' Logo */}
            <g transform="translate(184, 20) rotate(-13.5, 22, 20) scale(1.19)" opacity="0.31">
              <g stroke="#DE3121" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 34 L18 6 L30 34"/>
                <path d="M10 24 L26 24"/>
                <circle cx="37" cy="33" r="2.2" fill="#DE3121" stroke="none"/>
              </g>
            </g>

            {/* AI Sparkle */}
            <g transform="translate(267, 16) rotate(-3.0, 8, 8) scale(1.20)" opacity="0.28">
              <g stroke="#DE3121" strokeWidth="2.6" fill="none" strokeLinecap="round">
                <line x1="8" y1="2" x2="8" y2="14"/>
                <line x1="2" y1="8" x2="14" y2="8"/>
              </g>
            </g>

            {/* Smiley Face */}
            <g transform="translate(340, 31) rotate(-9.5, 16, 16) scale(1.01)" opacity="0.28">
              <g stroke="#DE3121" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="16" cy="16" r="14"/>
                <circle cx="11" cy="12" r="1.5" fill="#DE3121"/>
                <circle cx="21" cy="12" r="1.5" fill="#DE3121"/>
                <path d="M10 19 C 12 23, 20 23, 22 19"/>
              </g>
            </g>

            {/* Trend Line */}
            <g transform="translate(-7, 117) rotate(-15.2, 24, 16) scale(1.11)" opacity="0.28">
              <g stroke="#DE3121" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 26 L14 10 L24 24 L34 8 L45 26"/>
              </g>
            </g>

            {/* Safe-to-spend Bar */}
            <g transform="translate(67, 87) rotate(14.6, 26, 15) scale(1.16)" opacity="0.26">
              <g stroke="#DE3121" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="6" width="46" height="18" rx="9"/>
                <line x1="26" y1="6" x2="26" y2="24"/>
              </g>
            </g>

            {/* Another Crown */}
            <g transform="translate(135, 96) rotate(12.2, 24, 16) scale(1.00)" opacity="0.24">
              <g stroke="#DE3121" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 26 L4 10 L16 18 L24 6 L32 18 L44 10 L44 26 Z"/>
                <circle cx="4" cy="9" r="1.5" fill="#DE3121"/>
                <circle cx="24" cy="5" r="1.5" fill="#DE3121"/>
                <circle cx="44" cy="9" r="1.5" fill="#DE3121"/>
              </g>
            </g>

            {/* Naira Symbol */}
            <g transform="translate(281, 112) rotate(-11.9, 16, 14) scale(0.98)" opacity="0.30">
              <g stroke="#DE3121" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <line x1="10" y1="2" x2="10" y2="26"/>
                <line x1="22" y1="2" x2="22" y2="26"/>
                <line x1="2" y1="8" x2="30" y2="8"/>
                <line x1="2" y1="18" x2="30" y2="18"/>
              </g>
            </g>

            {/* Arrow Trend */}
            <g transform="translate(354, 108) rotate(13.5, 28, 19) scale(0.91)" opacity="0.35">
              <g stroke="#DE3121" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 28 C 14 36, 20 8, 32 18 C 40 24, 46 10, 52 4"/>
                <polyline points="44,4 52,4 52,12"/>
                <circle cx="4" cy="28" r="1.8" fill="#DE3121"/>
                <circle cx="32" cy="18" r="1.8" fill="#DE3121"/>
              </g>
            </g>

            {/* Credit Card */}
            <g transform="translate(4, 157) rotate(6.2, 25, 19) scale(1.18)" opacity="0.33">
              <g stroke="#DE3121" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="46" height="30" rx="6"/>
                <line x1="2" y1="13" x2="48" y2="13"/>
                <circle cx="12" cy="24" r="2" fill="#DE3121" stroke="none"/>
                <line x1="20" y1="24" x2="38" y2="24" strokeDasharray="3 3"/>
              </g>
            </g>

            {/* Acuity 'A.' Logo */}
            <g transform="translate(153, 171) rotate(-15.6, 22, 20) scale(1.02)" opacity="0.28">
              <g stroke="#DE3121" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 34 L18 6 L30 34"/>
                <path d="M10 24 L26 24"/>
                <circle cx="37" cy="33" r="2.2" fill="#DE3121" stroke="none"/>
              </g>
            </g>

            {/* Wallet/Card */}
            <g transform="translate(209, 199) rotate(-14.9, 25, 17) scale(1.13)" opacity="0.25">
              <g stroke="#DE3121" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="44" height="28" rx="5"/>
                <circle cx="14" cy="17" r="2.8"/>
                <line x1="24" y1="17" x2="38" y2="17"/>
              </g>
            </g>

            {/* AI Sparkle */}
            <g transform="translate(282, 205) rotate(11.0, 14, 14) scale(0.89)" opacity="0.29">
              <g stroke="#DE3121" strokeWidth="2.6" fill="none" strokeLinecap="round">
                <line x1="14" y1="2" x2="14" y2="26"/>
                <line x1="2" y1="14" x2="26" y2="14"/>
                <line x1="6" y1="6" x2="22" y2="22" strokeWidth="1.8"/>
                <line x1="22" y1="6" x2="6" y2="22" strokeWidth="1.8"/>
              </g>
            </g>

            {/* Trend Line */}
            <g transform="translate(334, 192) rotate(1.4, 24, 16) scale(1.02)" opacity="0.31">
              <g stroke="#DE3121" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 26 L14 10 L24 24 L34 8 L45 26"/>
              </g>
            </g>

            {/* Acuity 'A.' Logo */}
            <g transform="translate(-6, 232) rotate(-1.6, 22, 20) scale(0.97)" opacity="0.27">
              <g stroke="#DE3121" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 34 L18 6 L30 34"/>
                <path d="M10 24 L26 24"/>
                <circle cx="37" cy="33" r="2.2" fill="#DE3121" stroke="none"/>
              </g>
            </g>

            {/* Crown */}
            <g transform="translate(75, 260) rotate(15.3, 24, 16) scale(0.99)" opacity="0.30">
              <g stroke="#DE3121" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 26 L4 10 L16 18 L24 6 L32 18 L44 10 L44 26 Z"/>
                <circle cx="4" cy="9" r="1.5" fill="#DE3121"/>
                <circle cx="24" cy="5" r="1.5" fill="#DE3121"/>
                <circle cx="44" cy="9" r="1.5" fill="#DE3121"/>
              </g>
            </g>

            {/* Wallet/Card */}
            <g transform="translate(131, 280) rotate(-7.8, 25, 17) scale(1.09)" opacity="0.32">
              <g stroke="#DE3121" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="44" height="28" rx="5"/>
                <circle cx="14" cy="17" r="2.8"/>
                <line x1="24" y1="17" x2="38" y2="17"/>
              </g>
            </g>

            {/* Acuity 'A.' Logo */}
            <g transform="translate(232, 276) rotate(-10.4, 22, 20) scale(0.98)" opacity="0.29">
              <g stroke="#DE3121" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 34 L18 6 L30 34"/>
                <path d="M10 24 L26 24"/>
                <circle cx="37" cy="33" r="2.2" fill="#DE3121" stroke="none"/>
              </g>
            </g>

            {/* Naira Symbol */}
            <g transform="translate(146, 325) rotate(8.7, 16, 14) scale(1.15)" opacity="0.31">
              <g stroke="#DE3121" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <line x1="10" y1="2" x2="10" y2="26"/>
                <line x1="22" y1="2" x2="22" y2="26"/>
                <line x1="2" y1="8" x2="30" y2="8"/>
                <line x1="2" y1="18" x2="30" y2="18"/>
              </g>
            </g>

            {/* Credit Card */}
            <g transform="translate(61, 561) rotate(11.9, 25, 17) scale(0.93)" opacity="0.31">
              <g stroke="#DE3121" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="44" height="28" rx="5"/>
                <circle cx="14" cy="17" r="2.8"/>
                <line x1="24" y1="17" x2="38" y2="17"/>
              </g>
            </g>

            {/* Trend Line */}
            <g transform="translate(127, 575) rotate(-15.0, 24, 16) scale(0.90)" opacity="0.29">
              <g stroke="#DE3121" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 26 L14 10 L24 24 L34 8 L45 26"/>
              </g>
            </g>

            {/* Bell */}
            <g transform="translate(17, 661) rotate(6.7, 20, 18) scale(1.03)" opacity="0.25">
              <g stroke="#DE3121" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 4 C 18 2, 22 2, 22 4 C 28 6, 32 12, 32 20 L 34 26 L 6 26 L 8 20 C 8 12, 12 6, 18 4 Z"/>
                <path d="M16 29 C 16 31.5, 18 33, 20 33 C 22 33, 24 31.5, 24 29"/>
              </g>
            </g>

            {/* Acuity 'A.' Logo */}
            <g transform="translate(348, 396) rotate(-12.2, 22, 20) scale(0.93)" opacity="0.32">
              <g stroke="#DE3121" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 34 L18 6 L30 34"/>
                <path d="M10 24 L26 24"/>
                <circle cx="37" cy="33" r="2.2" fill="#DE3121" stroke="none"/>
              </g>
            </g>

            {/* Crown */}
            <g transform="translate(5, 484) rotate(-6.7, 24, 16) scale(1.01)" opacity="0.29">
              <g stroke="#DE3121" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 26 L4 10 L16 18 L24 6 L32 18 L44 10 L44 26 Z"/>
                <circle cx="4" cy="9" r="1.5" fill="#DE3121"/>
                <circle cx="24" cy="5" r="1.5" fill="#DE3121"/>
                <circle cx="44" cy="9" r="1.5" fill="#DE3121"/>
              </g>
            </g>

            {/* Credit Card */}
            <g transform="translate(341, 720) rotate(-1.2, 25, 17) scale(1.05)" opacity="0.34">
              <g stroke="#DE3121" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="44" height="28" rx="5"/>
                <circle cx="14" cy="17" r="2.8"/>
                <line x1="24" y1="17" x2="38" y2="17"/>
              </g>
            </g>

            {/* Arrow Trend */}
            <g transform="translate(-13, 778) rotate(-1.4, 24, 16) scale(1.17)" opacity="0.23">
              <g stroke="#DE3121" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 26 L14 10 L24 24 L34 8 L45 26"/>
              </g>
            </g>

            {/* Trend Line */}
            <g transform="translate(48, 810) rotate(6.1, 26, 15) scale(1.17)" opacity="0.33">
              <g stroke="#DE3121" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="6" width="46" height="18" rx="9"/>
                <line x1="26" y1="6" x2="26" y2="24"/>
              </g>
            </g>

            {/* Crown */}
            <g transform="translate(129, 781) rotate(13.1, 24, 16) scale(0.91)" opacity="0.34">
              <g stroke="#DE3121" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 26 L4 10 L16 18 L24 6 L32 18 L44 10 L44 26 Z"/>
                <circle cx="4" cy="9" r="1.5" fill="#DE3121"/>
                <circle cx="24" cy="5" r="1.5" fill="#DE3121"/>
                <circle cx="44" cy="9" r="1.5" fill="#DE3121"/>
              </g>
            </g>

            {/* Credit Card */}
            <g transform="translate(278, 791) rotate(-16.3, 25, 19) scale(1.02)" opacity="0.30">
              <g stroke="#DE3121" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="46" height="30" rx="6"/>
                <line x1="2" y1="13" x2="48" y2="13"/>
                <circle cx="12" cy="24" r="2" fill="#DE3121" stroke="none"/>
                <line x1="20" y1="24" x2="38" y2="24" strokeDasharray="3 3"/>
              </g>
            </g>

          </g>

          {/* Center Logo Anchor Group (Hidden, we render it via React for the pulse animation) */}
        </svg>
      </div>

      {/* DARK VIGNETTE OVERLAY */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.1) 100%)`
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