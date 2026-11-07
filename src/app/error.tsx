"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error Boundary caught error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center p-6 text-center select-none" style={{ background: "var(--bg, #0b0b0c)", color: "var(--text-1, #ffffff)" }}>
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--danger,#DE3121)]/15 text-[var(--danger,#DE3121)] border border-[var(--danger,#DE3121)]/20 mb-5">
        <AlertCircle size={32} />
      </div>

      <h1 className="text-[22px] font-bold tracking-tight mb-2">Something went wrong</h1>
      <p className="text-[14px] text-white/60 max-w-xs mb-8 leading-relaxed">
        A temporary error occurred while rendering this page. You can reload or return to the main dashboard.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          type="button"
          onClick={() => reset()}
          className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-[var(--brand,#DE3121)] text-[var(--brand-ink,#ffffff)] font-bold text-[14px] shadow-lg active:scale-98 transition-transform"
        >
          <RotateCcw size={16} />
          <span>Try again</span>
        </button>

        <button
          type="button"
          onClick={() => {
            window.location.href = "/";
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-full bg-white/10 text-white font-medium text-[13.5px] hover:bg-white/15 active:scale-98 transition-all"
        >
          <Home size={15} />
          <span>Go to Home</span>
        </button>
      </div>

      {process.env.NODE_ENV !== "production" && error?.message && (
        <pre className="mt-8 p-3 rounded-xl bg-black/60 border border-white/10 text-[11px] text-red-300 font-mono text-left max-w-sm overflow-x-auto">
          {error.message}
        </pre>
      )}
    </div>
  );
}
