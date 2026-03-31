import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
gsap.config({ force3D: true });

const EASE = 'power2.out';
const DUR  = { base: 0.65, slow: 0.9 };

// Track whether the last navigation used a View Transition morph
let _morphed = false;
let _ctx: gsap.Context | null = null;

document.addEventListener('astro:before-swap', () => {
  _ctx?.revert();
  _ctx = null;
});

document.addEventListener('astro:after-swap', () => {
  _morphed = document.documentElement.hasAttribute('data-astro-transition');
});

// Run cb once fonts are ready and layout is settled after astro:page-load
export function onReady(cb: () => void): void {
  _ctx = gsap.context(() => {});
  Promise.race([
    document.fonts.ready,
    new Promise<void>(r => setTimeout(r, 300)),
  ]).then(() => requestAnimationFrame(() => requestAnimationFrame(cb)));
}

// Animate [data-anim="hero"] and [data-anim="scroll"] elements into view
export function reveal(): void {
  ScrollTrigger.refresh();

  document.querySelectorAll<HTMLElement>('[data-anim="hero"]').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: DUR.slow, ease: EASE,
        delay: Number(el.dataset.delay ?? 0), clearProps: 'will-change' },
    );
  });

  ScrollTrigger.batch('[data-anim="scroll"]', {
    start: 'top 92%', once: true,
    onEnter: els => gsap.fromTo(els,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: DUR.base, ease: EASE,
        stagger: 0.07, clearProps: 'will-change' },
    ),
  });
}

// Stagger-reveal a set of elements when their trigger scrolls into view
export function staggerReveal(selector: string, trigger: string, delay = 0, stagger = 0.08): void {
  const els  = document.querySelectorAll<HTMLElement>(selector);
  const trig = document.querySelector<HTMLElement>(trigger);
  if (!els.length || !trig) return;

  ScrollTrigger.create({
    trigger: trig, start: 'top 90%', once: true,
    onEnter: () => gsap.fromTo(els,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: DUR.base, ease: EASE,
        stagger, delay, clearProps: 'will-change' },
    ),
  });
}

// Hero image entrance + scroll parallax
export function heroParallax(selector: string, strength = 15): void {
  const img = document.querySelector<HTMLElement>(selector);
  if (!img) return;

  if (_morphed) {
    gsap.set(img, { opacity: 1, scale: 1.14 });
  } else {
    gsap.fromTo(img,
      { opacity: 0, scale: 1.2 },
      { opacity: 1, scale: 1.14, duration: 1.8, ease: 'power3.out' },
    );
  }

  ScrollTrigger.create({
    trigger: document.documentElement, start: 'top top', end: 'bottom top', scrub: 2,
    onUpdate: st => gsap.set(img, { yPercent: -st.progress * strength }),
  });
}

// Product image entrance — skipped when VT morph handled it
export function imageEntrance(selector: string): void {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return;

  if (_morphed) {
    gsap.set(el, { opacity: 1, scale: 1 });
    return;
  }

  gsap.fromTo(el,
    { opacity: 0, scale: 1.06 },
    { opacity: 1, scale: 1, duration: 1.4, ease: 'power3.out' },
  );
}

// Parallax for lookbook spread images
export function chapterParallax(): void {
  document.querySelectorAll<HTMLElement>('.spread-hero').forEach(hero => {
    const img = hero.querySelector<HTMLElement>('.spread-img');
    const cap = hero.querySelector<HTMLElement>('.spread-cap');
    if (!img) return;

    gsap.set(img, { scale: 1.18 });

    ScrollTrigger.create({
      trigger: hero, start: 'top bottom', end: 'bottom top', scrub: 1.5,
      onUpdate: st => {
        gsap.set(img, { yPercent: -16 * st.progress });
        if (cap) gsap.set(cap, { yPercent: 5 * st.progress });
      },
    });
  });
}
