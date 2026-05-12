import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
gsap.config({ force3D: true });

export { gsap };
export const EASE = 'expo.out';
export const DUR = { major: 0.8, minor: 0.6, slow: 1.0 };
export const STAGGER = 0.12;

let lenis: Lenis | null = null;
export function getLenis(): Lenis | null { return lenis; }

function initLenis(): void {
  if (lenis || window.matchMedia('(hover: none)').matches) return;
  lenis = new Lenis({
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis!.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

export function initScrollLifecycle(): void {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  document.addEventListener('astro:before-swap', () => {
    lenis?.stop();
    ScrollTrigger.getAll().forEach(t => t.kill());
  });
  document.addEventListener('astro:after-swap', () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  });
  document.addEventListener('astro:page-load', () => {
    initLenis();
    lenis?.scrollTo(0, { immediate: true });
    lenis?.start();
    ScrollTrigger.refresh();
  });
}

const inView = (el: Element) =>
  el.getBoundingClientRect().top < window.innerHeight * 0.85;

function reveal(els: HTMLElement[], vars: gsap.TweenVars) {
  gsap.fromTo(els, { opacity: 0, y: 30 }, { opacity: 1, y: 0, clearProps: 'transform,will-change', ...vars });
}

export function initPage(ruleSelector?: string): void {
  // Hero elements
  const heroEls = [...document.querySelectorAll<HTMLElement>('[data-anim="hero"]')];
  heroEls.forEach(el =>
    reveal([el], { duration: DUR.major, ease: EASE, delay: parseFloat(el.dataset.delay ?? '0') || 0 })
  );

  // Rule lines
  if (ruleSelector) {
    document.querySelectorAll<HTMLElement>(ruleSelector).forEach(el =>
      gsap.fromTo(el,
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, duration: DUR.slow, ease: EASE, delay: 0.3, clearProps: 'will-change' },
      )
    );
  }

  // Product cards
  const cards = [...document.querySelectorAll<HTMLElement>('.pc')];
  if (cards.length) {
    gsap.fromTo(cards,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: DUR.major, ease: EASE, stagger: STAGGER, delay: heroEls.length ? 0.2 : 0, clearProps: 'transform,will-change' },
    );
  }

  // Scroll-triggered elements
  const scrollEls = [...document.querySelectorAll<HTMLElement>('[data-anim="scroll"]')];
  const scrollAbove = scrollEls.filter(inView);
  const scrollBelow = scrollEls.filter(el => !inView(el));
  if (scrollAbove.length) reveal(scrollAbove, { duration: DUR.major, ease: EASE, stagger: STAGGER, delay: heroEls.length ? 0.1 : 0 });
  if (scrollBelow.length) ScrollTrigger.batch(scrollBelow, {
    start: 'top 88%', once: true,
    onEnter: els => reveal([...els] as HTMLElement[], { duration: DUR.major, ease: EASE, stagger: STAGGER }),
  });

  // Stagger elements
  const staggerEls = [...document.querySelectorAll<HTMLElement>('[data-anim="stagger"]')];
  const staggerAbove = staggerEls.filter(inView);
  const staggerBelow = staggerEls.filter(el => !inView(el));
  if (staggerAbove.length) reveal(staggerAbove, { duration: DUR.minor, ease: EASE, stagger: 0.1 });
  if (staggerBelow.length) ScrollTrigger.batch(staggerBelow, {
    start: 'top 90%', once: true,
    onEnter: els => reveal([...els] as HTMLElement[], { duration: DUR.minor, ease: EASE, stagger: 0.1 }),
  });

  ScrollTrigger.refresh();
}

export function onReady(callback: () => void): void {
  Promise.race([document.fonts.ready, new Promise<void>(r => setTimeout(r, 300))])
    .then(() => requestAnimationFrame(() => requestAnimationFrame(callback)));
}
