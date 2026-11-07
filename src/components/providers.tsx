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
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "production") {
        navigator.serviceWorker.register("/sw.js").catch((err) => {
          console.warn("ServiceWorker registration failed:", err);
        });
      } else {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
      }
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