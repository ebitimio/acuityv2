"use client";

import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "@/lib/theme";
import { CurrencyProvider } from "@/lib/currency";
import { WorkspaceProvider } from "@/lib/workspace";
import { ToastProvider } from "@/components/ui/toast";
import { AmbientBackground } from "@/components/ui/ambient-background";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        <CurrencyProvider>
          <WorkspaceProvider>
            <ToastProvider>
              <AmbientBackground />
              {children}
            </ToastProvider>
          </WorkspaceProvider>
        </CurrencyProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}