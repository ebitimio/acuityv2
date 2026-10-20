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
            background:
              "linear-gradient(160deg, #7a0e0e 0%, #b3391f 35%, #e87a1a 75%, #ffb347 100%)",
            marginTop: "calc(-1 * env(safe-area-inset-top))",
            marginBottom: "calc(-1 * env(safe-area-inset-bottom))",
            paddingTop: "env(safe-area-inset-top)",
            paddingBottom: "env(safe-area-inset-bottom)",
            top: 0,
            bottom: 0,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
            className="flex flex-col items-center gap-4"
          >
            <h1
              className="text-black font-black"
              style={{
                fontSize: "clamp(60px, 20vw, 112px)",
                lineHeight: 0.9,
                letterSpacing: "-0.05em",
                fontWeight: 900,
              }}
            >
              ACUITY
            </h1>
          </motion.div>

          <div
            className="absolute left-0 right-0 flex justify-center"
            style={{ bottom: "calc(env(safe-area-inset-bottom) + 56px)" }}
          >
            <div className="w-32 h-1 bg-black/15 rounded-full overflow-hidden">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity }}
                className="w-1/2 h-full bg-black/70 rounded-full"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}