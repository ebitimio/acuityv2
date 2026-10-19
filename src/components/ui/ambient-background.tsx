"use client";

export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black">
      <div className="ambient-orb ambient-a" />
      <div className="ambient-orb ambient-b" />
      <div className="ambient-orb ambient-c" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/45 to-black/75" />
    </div>
  );
}