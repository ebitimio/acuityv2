"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 450);
    }, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center"
          style={{
            background: "var(--bg)",
            paddingTop: "env(safe-area-inset-top)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
            className="flex flex-col items-center"
          >
            <h1
              className="font-black"
              style={{
                fontSize: "clamp(52px, 18vw, 96px)",
                lineHeight: 0.9,
                letterSpacing: "-0.05em",
                fontWeight: 900,
                color: "var(--text-1)",
              }}
            >
              ACUITY
            </h1>
          </motion.div>

          <div
            className="absolute left-0 right-0 flex justify-center"
            style={{ bottom: "calc(env(safe-area-inset-bottom) + 56px)" }}
          >
            <div
              className="h-1 w-32 overflow-hidden rounded-full"
              style={{ background: "var(--fill-2)" }}
            >
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity }}
                className="h-full w-1/2 rounded-full"
                style={{ background: "var(--text-1)" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}