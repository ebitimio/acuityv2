"use client";

export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={{ background: "var(--bg)" }}>
      <div className="ambient-orb ambient-a" />
    </div>
  );
}
