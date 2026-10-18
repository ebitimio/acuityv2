"use client";

import { useEffect } from "react";
import { CurrencyProvider } from "@/lib/currency";
import { ToastProvider } from "@/components/ui/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return (
    <CurrencyProvider>
      <ToastProvider>{children}</ToastProvider>
    </CurrencyProvider>
  );
}