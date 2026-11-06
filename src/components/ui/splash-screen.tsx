"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";

function useSafeTheme() {
  try {
    return useTheme();
  } catch {
    return null;
  }
}

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [mounted, setMounted] = useState(false);
  const themeCtx = useSafeTheme();
  const [isLightState, setIsLightState] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof document !== "undefined") {
      setIsLightState(
        document.documentElement.dataset.theme === "light" ||
        document.documentElement.classList.contains("light")
      );
    }
  }, []);

  const isLight = mounted ? (themeCtx?.resolved === "light" || isLightState) : false;

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2400); // 2.4s splash for optimal brand presentation

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden select-none transition-colors duration-300"
      style={{
        background: isLight ? "#f8f8fb" : "#0b0b0c",
      }}
    >
      {/* Authentic Acuity Doodle Art - Dark Mode Canvas */}
      <motion.img
        src="/splash-doodle-dark.jpg"
        alt="Acuity"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLight ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
      />

      {/* Authentic Acuity Doodle Art - Smart Light Mode Canvas */}
      <motion.img
        src="/splash-doodle-light.jpg"
        alt="Acuity"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLight ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
      />

      {/* Ambient Brand Orange Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[460px] h-[320px] sm:h-[460px] rounded-full blur-[80px] pointer-events-none"
        style={{
          background: isLight
            ? "radial-gradient(circle, rgba(222, 49, 33, 0.08) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(222, 49, 33, 0.16) 0%, transparent 70%)",
        }}
      />

      {/* Sleek Minimalist Loading Progress Line */}
      <div className="absolute bottom-10 sm:bottom-12 z-20 flex flex-col items-center">
        <div className="w-32 sm:w-40 h-1 rounded-full overflow-hidden bg-black/10 dark:bg-white/10 p-0.5">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-1/2 h-full rounded-full shadow-[0_0_8px_#DE3121]"
            style={{ background: "#DE3121" }}
          />
        </div>
      </div>
    </div>
  );
}
