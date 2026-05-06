import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
gsap.config({ force3D: true });

export { gsap };
export const EASE = 'expo.out';
export const DUR = { fast: 0.4, base: 0.6, slow: 0.9, slower: 1.1 };

// ─── Lenis smooth scroll ─────────────────────────────────────────────────────

const lenis = new Lenis({ duration: 1.2, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });

// Sync GSAP ScrollTrigger with Lenis
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// Pause/resume around view transitions so Lenis doesn't fight the swap
document.addEventListener('astro:before-swap', () => {
  lenis.stop();
  ScrollTrigger.getAll().forEach(t => t.kill());
});
document.addEventListener('astro:after-swap', () => {
  lenis.scrollTo(0, { immediate: true });
  lenis.start();
});

// ─── Helpers ────────────────────────────────────────────────────────────────

const inView = (el: Element) =>
  el.getBoundingClientRect().top < window.innerHeight * 0.9;

function animateIn(els: HTMLElement[], vars: gsap.TweenVars) {
  gsap.fromTo(els, { opacity: 0, y: 20 }, { opacity: 1, y: 0, clearProps: 'transform,will-change', ...vars });
}

// ─── Main page init ──────────────────────────────────────────────────────────

/**
 * Call once per page inside onReady().
 * Handles: hero elements, scroll reveals, rules, product cards.
 * Optional: pass a selector for a horizontal rule to reveal (e.g. '.ph .rule').
 */
export function initPage(ruleSelector?: string): void {
  ScrollTrigger.refresh();

  // 1. Hero elements — immediate, staggered by data-delay
  const heroEls = [...document.querySelectorAll<HTMLElement>('[data-anim="hero"]')];
  heroEls.forEach(el => {
    animateIn([el], {
      duration: DUR.slow,
      ease: EASE,
      delay: parseFloat(el.dataset.delay ?? '0') || 0,
    });
  });

  // 2. Rule reveal — after hero
  if (ruleSelector) {
    document.querySelectorAll<HTMLElement>(ruleSelector).forEach(el => {
      gsap.fromTo(el,
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, duration: DUR.slower, ease: EASE, delay: 0.3, clearProps: 'will-change' },
      );
    });
  }

  // 3. Product cards — cascade
  const cards = [...document.querySelectorAll<HTMLElement>('.pc')];
  if (cards.length) {
    gsap.fromTo(cards,
      { opacity: 0, y: 32 },
      { opacity: 1, y: 0, duration: DUR.slow, ease: EASE, stagger: 0.06, delay: heroEls.length ? 0.2 : 0, clearProps: 'transform,will-change' },
    );
  }

  // 4. Scroll-triggered elements — split in-view vs below
  const scrollEls = [...document.querySelectorAll<HTMLElement>('[data-anim="scroll"]')];
  const above = scrollEls.filter(inView);
  const below = scrollEls.filter(el => !inView(el));

  if (above.length) {
    animateIn(above, { duration: DUR.slow, ease: EASE, stagger: 0.07, delay: heroEls.length ? 0.1 : 0 });
  }
  if (below.length) {
    ScrollTrigger.batch(below, {
      start: 'top 88%', once: true,
      onEnter: els => animateIn([...els] as HTMLElement[], { duration: DUR.slow, ease: EASE, stagger: 0.07 }),
    });
  }

  // 5. Stagger children
  const staggerEls = [...document.querySelectorAll<HTMLElement>('[data-anim="stagger"]')];
  const staggerAbove = staggerEls.filter(inView);
  const staggerBelow = staggerEls.filter(el => !inView(el));

  if (staggerAbove.length) {
    animateIn(staggerAbove, { duration: DUR.base, ease: EASE, stagger: 0.05 });
  }
  if (staggerBelow.length) {
    ScrollTrigger.batch(staggerBelow, {
      start: 'top 90%', once: true,
      onEnter: els => animateIn([...els] as HTMLElement[], { duration: DUR.base, ease: EASE, stagger: 0.05 }),
    });
  }
}

// ─── onReady ────────────────────────────────────────────────────────────────

export function onReady(callback: () => void): void {
  Promise.race([document.fonts.ready, new Promise<void>(r => setTimeout(r, 300))])
    .then(() => requestAnimationFrame(() => requestAnimationFrame(callback)));
}
