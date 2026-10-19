// One shared motion vocabulary. Every spring in the app should come from here
// so the whole UI feels like it has the same physical material.
export const spring = {
  soft: { type: "spring", stiffness: 260, damping: 30, mass: 0.9 },
  snappy: { type: "spring", stiffness: 520, damping: 38 },
  sheet: { type: "spring", stiffness: 380, damping: 36 },
  // slight overshoot = the "liquid" settle on the tab lens and pressed glass
  liquid: { type: "spring", stiffness: 380, damping: 24, mass: 0.9 },
} as const;

export const ease = { out: [0.2, 0.8, 0.2, 1] as [number, number, number, number] };

// Use on list parents/children for a single staggered reveal (e.g. Recent transactions).
export const stagger = {
  parent: { hidden: {}, show: { transition: { staggerChildren: 0.045, delayChildren: 0.04 } } },
  item: {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: spring.soft },
  },
};