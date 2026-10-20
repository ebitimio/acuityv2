"use client";

export function HomeSkeleton() {
  return (
    <div className="min-h-[100dvh] animate-pulse" style={{ background: "var(--bg)" }}>
      <div className="px-5 pt-safe">
        <div className="mt-3 h-8 w-40 rounded-xl bg-[var(--fill-1)]" />
        <div className="mt-6 h-[240px] rounded-[24px] bg-[var(--surface-2)]" />
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="h-14 rounded-[18px] bg-[var(--surface-2)]" />
          <div className="h-14 rounded-[18px] bg-[var(--surface-2)]" />
          <div className="h-14 rounded-[18px] bg-[var(--surface-2)]" />
        </div>
        <div className="mt-6 space-y-3">
          <div className="h-[120px] rounded-[18px] bg-[var(--surface-2)]" />
          <div className="h-[260px] rounded-[22px] bg-[var(--surface-2)]" />
        </div>
      </div>
    </div>
  );
}