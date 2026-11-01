import { cubicIn, quintOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";

// Keep these in sync with the motion tokens in src/app.css.
export const MOTION = {
  fast: 180,
  base: 320,
  slow: 700,
  panel: 480,
  panelOut: 300,
  stagger: 70,
} as const;

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Fade in on the shared out-curve; fade out on the shared in-curve. */
export function fade(
  _: Element,
  { duration = MOTION.base }: { duration?: number } = {},
  intro = true,
): TransitionConfig {
  if (prefersReducedMotion()) return { duration: 0 };

  return {
    duration: intro ? duration : Math.min(duration, MOTION.panelOut),
    easing: intro ? quintOut : cubicIn,
    css: (t) => `opacity:${t}`,
  };
}

/** Short rise + fade used for panels, menu rows, and other orchestrated entrances. */
export function rise(
  _: Element,
  { y = 18, duration = MOTION.panel, delay = 0 }: { y?: number; duration?: number; delay?: number } = {},
  intro = true,
): TransitionConfig {
  if (prefersReducedMotion()) return { duration: 0 };

  return {
    delay: intro ? delay : 0,
    duration: intro ? duration : Math.min(duration, MOTION.panelOut),
    easing: intro ? quintOut : cubicIn,
    css: (t) => `opacity:${t}; transform:translate3d(0, ${(1 - t) * y}px, 0)`,
  };
}
