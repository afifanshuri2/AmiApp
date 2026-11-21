// Shared enter/exit/reflow motion for rows that are added, removed or reordered.
export const itemMotion = {
  layout: true,
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: 28 },
  transition: { type: "spring" as const, stiffness: 420, damping: 36 },
};
