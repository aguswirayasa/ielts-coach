import type { Transition, Variants } from "motion/react";

/*
 * Apple-style springs (apple-design §3-5): critically damped by default so
 * motion is interruptible and never overshoots; bounce only where the user
 * supplied momentum. `bounce: 0` maps to Apple's damping 1.0.
 */

/** Default UI spring: critically damped, no overshoot. */
export const spring: Transition = {
  type: "spring",
  bounce: 0,
  duration: 0.4,
};

/** Snappier variant for small chrome (pills, indicators). */
export const springSnappy: Transition = {
  type: "spring",
  bounce: 0,
  duration: 0.3,
};

/** Momentum variant: slight bounce, only for flicked/physical interactions. */
export const springBounce: Transition = {
  type: "spring",
  bounce: 0.2,
  duration: 0.45,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: spring },
};

/** Kept for compatibility with pages that pass it to `transition`. */
export const fadeUpTransition: Transition = spring;

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};
