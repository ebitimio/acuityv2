"use client";

import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

export function ScreenHeader({ title, onBack, right }: { title: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <header
      className="sticky top-0 z-40 border-b border-[var(--line)] px-5 pb-3"
      style={{
        paddingTop: "calc(env(safe-area-inset-top) + 12px)",
        background: "color-mix(in srgb, var(--bg) 82%, transparent)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="flex h-10 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1">
          {onBack && (
            <button
              aria-label="Back"
              onClick={onBack}
              className="press -ml-2 flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-1)]"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          <h1 className="truncate text-[22px] font-bold tracking-tight text-[var(--text-1)]">
            {title}
          </h1>
        </div>
        {right}
      </div>
    </header>
  );
}

export function IconButton({ label, onClick, children }: { label: string; onClick?: () => void; children: ReactNode }) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="press flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--text-2)]"
      style={{ background: "var(--fill-1)" }}
    >
      {children}
    </button>
  );
}
