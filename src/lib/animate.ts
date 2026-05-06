import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
gsap.config({ force3D: true });

export { gsap };
export const EASE = 'expo.out';
export const DUR = { fast: 0.4, base: 0.6, slow: 0.9, slower: 1.1 };

let lenis: Lenis;

function getLenis(): Lenis {
  if (!lenis) {
    lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    (window as any).__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  return lenis;
}

if (typeof document !== 'undefined') {
  document.addEventListener('astro:before-swap', () => {
    getLenis().stop();
    ScrollTrigger.getAll().forEach(t => t.kill());
  });
  document.addEventListener('astro:after-swap', () => {
    getLenis().scrollTo(0, { immediate: true });
    getLenis().start();
  });
}

const inView = (el: Element) =>
  el.getBoundingClientRect().top < window.innerHeight * 0.85;

function animateIn(els: HTMLElement[], vars: gsap.TweenVars) {
  gsap.fromTo(els, { opacity: 0, y: 20 }, { opacity: 1, y: 0, clearProps: 'transform,will-change', ...vars });
}

export function initPage(ruleSelector?: string): void {
  getLenis();
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
