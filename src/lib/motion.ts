import type { Transition, Variants } from "motion/react";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const fadeUpTransition: Transition = {
  duration: 0.45,
  ease: "easeOut",
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
