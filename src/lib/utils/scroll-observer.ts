import { MOTION, prefersReducedMotion } from "./motion.js";

const SCROLL_SELECTOR = '[data-anim="scroll"], [data-anim="rule"], [data-stagger]';
const HERO_SELECTOR = '[data-anim="hero"]';
const MAX_STAGGER_MS = 420;
const ROOT_MARGIN = "0px 0px -12% 0px";
const VIEWPORT_RATIO = 0.88;

function readDelay(element: HTMLElement, fallback: number): number {
  const value = element.dataset.delay;
  if (value === undefined) return fallback;

  const seconds = Number(value);
  return Number.isFinite(seconds) ? Math.max(0, seconds) * 1000 : fallback;
}

function setRevealDelay(element: HTMLElement, milliseconds: number): void {
  element.style.setProperty("--reveal-delay", `${milliseconds}ms`);
}

/** Stagger direct children, capped so long grids never feel sluggish. */
function staggerChildren(element: HTMLElement): void {
  for (const [index, child] of [...element.children].entries()) {
    if (child instanceof HTMLElement) {
      child.style.transitionDelay = `${Math.min(index * MOTION.stagger, MAX_STAGGER_MS)}ms`;
    }
  }
}

function prepare(element: HTMLElement, fallbackDelay: number): void {
  setRevealDelay(element, readDelay(element, fallbackDelay));
  if (element.hasAttribute("data-stagger")) staggerChildren(element);
}

function isPastRevealLine(element: HTMLElement): boolean {
  return element.getBoundingClientRect().top <= window.innerHeight * VIEWPORT_RATIO;
}

/**
 * Reveals hero elements on the next frame and scroll elements when they enter
 * the viewport. Delays are expressed in seconds via `data-delay` and applied by
 * CSS, so the animation stays on the compositor thread.
 *
 * A cheap scroll sweep backs up the observer: a jump from top to bottom (End,
 * anchor links, restored scroll position) skips the intersection transition,
 * and those sections must not be left invisible above the viewport.
 */
export function observeAnimations(): () => void {
  const heroes = [...document.querySelectorAll<HTMLElement>(HERO_SELECTOR)].filter(
    (element) => !element.classList.contains("in-view"),
  );
  const scrollElements = [...document.querySelectorAll<HTMLElement>(SCROLL_SELECTOR)].filter(
    (element) => !element.classList.contains("in-view"),
  );

  for (const [index, element] of heroes.entries()) {
    prepare(element, index * MOTION.stagger);
  }
  for (const element of scrollElements) {
    prepare(element, 0);
  }

  if (prefersReducedMotion()) {
    for (const element of [...heroes, ...scrollElements]) element.classList.add("in-view");
    return () => {};
  }

  const pending = new Set(scrollElements);

  function markRevealed(element: HTMLElement): void {
    if (!pending.delete(element)) return;
    element.classList.add("in-view");
    observer.unobserve(element);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) markRevealed(entry.target as HTMLElement);
      }
    },
    { rootMargin: ROOT_MARGIN },
  );

  for (const element of scrollElements) observer.observe(element);

  let sweepFrame = 0;

  function sweep(): void {
    sweepFrame = 0;
    if (pending.size === 0) return;

    const due: HTMLElement[] = [];
    for (const element of pending) {
      if (isPastRevealLine(element)) due.push(element);
    }
    for (const element of due) markRevealed(element);
  }

  function scheduleSweep(): void {
    if (sweepFrame || pending.size === 0) return;
    sweepFrame = requestAnimationFrame(sweep);
  }

  window.addEventListener("scroll", scheduleSweep, { passive: true });
  window.addEventListener("resize", scheduleSweep);
  scheduleSweep();

  const heroFrame = requestAnimationFrame(() => {
    for (const element of heroes) element.classList.add("in-view");
  });

  return () => {
    cancelAnimationFrame(heroFrame);
    if (sweepFrame) cancelAnimationFrame(sweepFrame);
    window.removeEventListener("scroll", scheduleSweep);
    window.removeEventListener("resize", scheduleSweep);
    observer.disconnect();
  };
}

/**
 * Scroll reveal for dynamic groups that are mounted after navigation
 * (for example, the collection grid when filters are cleared).
 */
export function revealGroup(node: HTMLElement): { destroy: () => void } {
  prepare(node, 0);

  if (prefersReducedMotion()) {
    node.classList.add("in-view");
    return { destroy: () => {} };
  }

  // Let the hidden state paint before revealing so a group mounted already in
  // view still plays its entrance instead of snapping into place.
  if (isPastRevealLine(node)) {
    const frame = requestAnimationFrame(() => node.classList.add("in-view"));
    return { destroy: () => cancelAnimationFrame(frame) };
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        node.classList.add("in-view");
        observer.disconnect();
      }
    },
    { rootMargin: ROOT_MARGIN },
  );

  observer.observe(node);
  return { destroy: () => observer.disconnect() };
}
