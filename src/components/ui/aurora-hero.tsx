"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export function AuroraHero({ children }: { children?: React.ReactNode }) {
  const { scrollY } = useScroll();
  
  // Parallax the gradient at ~0.4x speed as the user scrolls
  const y = useTransform(scrollY, [0, 1000], [0, 400]);
  
  // Fade out as the user scrolls past the hero area
  const opacity = useTransform(scrollY, [0, 300], [1, 0.2]);

  return (
    <div className="relative overflow-hidden w-full h-[400px] -mb-[200px]">
      {/* Aurora blobs */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ y, opacity }}
      >
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-20%] w-[70%] h-[70%] rounded-full bg-[#0e5a2b] blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 100, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#30d158] opacity-30 blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, 60, 0],
            y: [0, -60, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] left-[20%] w-[80%] h-[80%] rounded-full bg-[#0b3d1e] blur-[130px]"
        />
      </motion.div>

      {/* Film grain / noise overlay to prevent color banding */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* The content that sits on top of the aurora (Hero text, etc.) */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
