"use client";

import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

export function ScreenHeader({ title, onBack, right }: { title: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg)]/85 px-5 pb-3 pt-safe backdrop-blur-xl">
      <div className="flex h-10 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1">
          {onBack && (
            <button aria-label="Back" onClick={onBack} className="press -ml-2 flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10"><ChevronLeft size={24} /></button>
          )}
          <h1 className="truncate text-[22px] font-extrabold tracking-tight">{title}</h1>
        </div>
        {right}
      </div>
    </header>
  );
}

export function IconButton({ label, onClick, children }: { label: string; onClick?: () => void; children: ReactNode }) {
  return (
    <button aria-label={label} onClick={onClick} className="press flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.08] hover:bg-white/[0.14]">{children}</button>
  );
}