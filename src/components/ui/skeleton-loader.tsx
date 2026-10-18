"use client";

export function HomeSkeleton() {
  return (
    <div className="min-h-[100dvh] animate-pulse bg-black">
      <div className="h-[300px] rounded-b-[36px] bg-[var(--surface-2)] px-5 pt-safe">
        <div className="flex justify-between">
          <div className="h-10 w-10 rounded-full bg-white/10" />
          <div className="h-10 w-24 rounded-full bg-white/10" />
        </div>
        <div className="mt-10 h-4 w-32 rounded-md bg-white/10" />
        <div className="mt-3 h-12 w-64 rounded-xl bg-white/10" />
      </div>
      <div className="mt-6 space-y-3 px-4">
        <div className="h-[200px] rounded-[22px] bg-[var(--surface-2)]" />
        <div className="h-[96px] rounded-[22px] bg-[var(--surface-2)]" />
        <div className="h-[260px] rounded-[22px] bg-[var(--surface-2)]" />
      </div>
    </div>
  );
}