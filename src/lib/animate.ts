import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
gsap.config({ force3D: true });

export { gsap };
export const EASE = 'expo.out';
export const DUR = { base: 0.6, slow: 0.9, slower: 1.1 };

const isTouch = () => window.matchMedia('(hover: none)').matches;

let lenis: Lenis | null = null;

export function getLenis(): Lenis | null { return lenis; }

function initLenis(): void {
  if (lenis || isTouch()) return;
  lenis = new Lenis({
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis!.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

export function initScrollLifecycle(): void {
  document.addEventListener('astro:before-swap', () => {
    lenis?.stop();
    ScrollTrigger.getAll().forEach(t => t.kill());
  });
  document.addEventListener('astro:after-swap', () => {
    // Reset window scroll
    window.scrollTo({ top: 0, behavior: 'instant' });
    lenis?.scrollTo(0, { immediate: true });
    // Also reset any inner scrollable panels (e.g. sticky product page columns)
    document.querySelectorAll<HTMLElement>('[data-scroll-panel]').forEach(el => {
      el.scrollTop = 0;
    });
  });
  document.addEventListener('astro:page-load', () => {
    initLenis();
    lenis?.start();
  });
}

const inView = (el: Element) =>
  el.getBoundingClientRect().top < window.innerHeight * 0.85;

function animateIn(els: HTMLElement[], vars: gsap.TweenVars) {
  gsap.fromTo(els, { opacity: 0, y: 20 }, { opacity: 1, y: 0, clearProps: 'transform,will-change', ...vars });
}

export function initPage(ruleSelector?: string): void {
  ScrollTrigger.refresh();

  const heroEls = [...document.querySelectorAll<HTMLElement>('[data-anim="hero"]')];
  heroEls.forEach(el =>
    animateIn([el], { duration: DUR.slow, ease: EASE, delay: parseFloat(el.dataset.delay ?? '0') || 0 })
  );

  if (ruleSelector) {
    document.querySelectorAll<HTMLElement>(ruleSelector).forEach(el =>
      gsap.fromTo(el,
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, duration: DUR.slower, ease: EASE, delay: 0.3, clearProps: 'will-change' },
      )
    );
  }

  const cards = [...document.querySelectorAll<HTMLElement>('.pc')];
  if (cards.length) {
    gsap.fromTo(cards,
      { opacity: 0, y: 32 },
      { opacity: 1, y: 0, duration: DUR.slow, ease: EASE, stagger: 0.06, delay: heroEls.length ? 0.2 : 0, clearProps: 'transform,will-change' },
    );
  }

  const scrollEls = [...document.querySelectorAll<HTMLElement>('[data-anim="scroll"]')];
  const scrollAbove = scrollEls.filter(inView);
  const scrollBelow = scrollEls.filter(el => !inView(el));
  if (scrollAbove.length) animateIn(scrollAbove, { duration: DUR.slow, ease: EASE, stagger: 0.07, delay: heroEls.length ? 0.1 : 0 });
  if (scrollBelow.length) ScrollTrigger.batch(scrollBelow, {
    start: 'top 88%', once: true,
    onEnter: els => animateIn([...els] as HTMLElement[], { duration: DUR.slow, ease: EASE, stagger: 0.07 }),
  });

  const staggerEls = [...document.querySelectorAll<HTMLElement>('[data-anim="stagger"]')];
  const staggerAbove = staggerEls.filter(inView);
  const staggerBelow = staggerEls.filter(el => !inView(el));
  if (staggerAbove.length) animateIn(staggerAbove, { duration: DUR.base, ease: EASE, stagger: 0.05 });
  if (staggerBelow.length) ScrollTrigger.batch(staggerBelow, {
    start: 'top 90%', once: true,
    onEnter: els => animateIn([...els] as HTMLElement[], { duration: DUR.base, ease: EASE, stagger: 0.05 }),
  });
}

export function onReady(callback: () => void): void {
  Promise.race([document.fonts.ready, new Promise<void>(r => setTimeout(r, 300))])
    .then(() => requestAnimationFrame(() => requestAnimationFrame(callback)));
}
