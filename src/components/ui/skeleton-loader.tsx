"use client";

export function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-black pb-32 relative animate-pulse">
      {/* Hero Skeleton */}
      <div className="h-[400px] w-full bg-gradient-to-b from-[#0e5a2b]/20 to-black pt-24 px-6">
        <div className="h-4 w-32 bg-white/10 rounded-md mb-4" />
        <div className="h-16 w-64 bg-white/10 rounded-xl" />
      </div>

      {/* Content Skeleton */}
      <div className="relative z-20 px-6 -mt-12 flex flex-col gap-6">
        <div className="h-[160px] w-full bg-white/5 rounded-[28px] border border-white/10" />
        
        <div className="grid grid-cols-2 gap-3">
          <div className="h-[120px] bg-white/5 rounded-2xl border border-white/10" />
          <div className="h-[120px] bg-white/5 rounded-2xl border border-white/10" />
        </div>

        <div className="h-[60px] w-full bg-white/5 rounded-2xl border border-white/10" />

        <div className="mt-4">
          <div className="h-6 w-48 bg-white/10 rounded-md mb-4" />
          <div className="h-[300px] w-full bg-white/5 rounded-2xl border border-white/10" />
        </div>
      </div>
    </div>
  );
}