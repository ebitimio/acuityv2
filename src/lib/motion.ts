export const spring = {
  soft: { type: "spring", stiffness: 260, damping: 30, mass: 0.9 },
  smooth: { type: "spring", stiffness: 300, damping: 30 },
  snappy: { type: "spring", stiffness: 520, damping: 38 },
  sheet: { type: "spring", stiffness: 380, damping: 36 },
  liquid: { type: "spring", stiffness: 380, damping: 24, mass: 0.9 },
} as const;

export const ease = { out: [0.2, 0.8, 0.2, 1] as [number, number, number, number] };

export const stagger = {
  parent: { hidden: {}, show: { transition: { staggerChildren: 0.045, delayChildren: 0.04 } } },
  item: {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: spring.soft },
  },
};