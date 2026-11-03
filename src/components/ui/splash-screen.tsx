"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000); // Waits 2 seconds, then enters the app

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0b0b0c]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        className="flex items-baseline"
      >
        <span className="text-[48px] font-black tracking-tighter text-white">ACUITY</span>
        
        {/* The dot pulses slightly while loading */}
        <motion.span 
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-[48px] font-black tracking-tighter" 
          style={{ color: "#DE3121" }}
        >
          .
        </motion.span>
      </motion.div>
    </div>
  );
}