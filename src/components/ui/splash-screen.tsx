"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Total splash duration: 1.6s
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 400); // Wait for exit animation to finish
    }, 1600);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black"
        >
          {/* Emerald Bloom */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.3, scale: 1.2 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute w-64 h-64 rounded-full bg-[var(--brand)] blur-[80px]"
          />

          {/* SVG Logo */}
          <div className="relative z-10 flex flex-col items-center">
            <svg
              width="80"
              height="80"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* The "A" shape drawn with stroke */}
              <motion.path
                d="M 20 80 L 50 20 L 80 80"
                stroke="var(--brand)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeInOut", delay: 0.1 }}
              />
              {/* The crossbar */}
              <motion.path
                d="M 35 60 L 65 60"
                stroke="var(--brand)"
                strokeWidth="6"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeInOut", delay: 0.5 }}
              />
              {/* Specular sweep */}
              <motion.path
                d="M 20 80 L 50 20 L 80 80"
                stroke="rgba(255,255,255,0.8)"
                strokeWidth="6"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: [0, 0.8, 0] }}
                transition={{ duration: 0.8, ease: "easeInOut", delay: 0.8 }}
              />
            </svg>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.4 }}
              className="text-white text-[17px] font-semibold tracking-wider mt-4"
            >
              ACUITY
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}