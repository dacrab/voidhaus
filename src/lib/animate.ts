import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);
gsap.config({ force3D: true });

const EASE = { out: 'power2.out', in: 'power2.in', io: 'power2.inOut', expo: 'expo.out', circ: 'circ.out' };
const DUR  = { xs: 0.3, sm: 0.5, md: 0.7, lg: 1.0, xl: 1.4 };

// Kill all ScrollTriggers before each Astro page swap to prevent leaks
let _morphed = false;

document.addEventListener('astro:before-swap', () => { ScrollTrigger.getAll().forEach(t => t.kill()); });
document.addEventListener('astro:after-swap',  () => {
  _morphed = document.documentElement.hasAttribute('data-astro-transition');
});

// Double rAF ensures fonts and layout are settled before animating
export function onReady(cb: () => void): void {
  Promise.race([document.fonts.ready, new Promise<void>(r => setTimeout(r, 300))])
    .then(() => requestAnimationFrame(() => requestAnimationFrame(cb)));
}

// Wraps the astro:page-load + onReady boilerplate every page uses
export function onPageLoad(cb: () => void): void {
  document.addEventListener('astro:page-load', () => onReady(cb));
}

export const morphed = () => _morphed;

// reveal() + lineReveal on the PageHeader rule — called together on every page with a header
export function pageReveal(lineDelay = 0.3): void {
  reveal();
  lineReveal('.ph .rule', lineDelay);
}

export function reveal(): void {
  ScrollTrigger.refresh();

  document.querySelectorAll<HTMLElement>('[data-anim="hero"]').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 22 },
      { opacity: 1, y: 0, duration: DUR.md, ease: EASE.expo,
        delay: parseFloat(el.dataset.delay ?? '0') || 0, clearProps: 'will-change' },
    );
  });

  ScrollTrigger.batch('[data-anim="scroll"]', {
    start: 'top 90%', once: true,
    onEnter: els => gsap.fromTo(els,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: DUR.md, ease: EASE.expo, stagger: 0.08, clearProps: 'will-change' },
    ),
  });
}

export function titleReveal(selector: string, delay = 0): void {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) { if (import.meta.env.DEV) console.warn(`[animate] element not found: ${selector}`); return; }
  gsap.fromTo(el,
    { opacity: 0, y: 32, skewY: 1.5 },
    { opacity: 1, y: 0, skewY: 0, duration: DUR.lg, ease: EASE.expo, delay, clearProps: 'will-change,skewY' },
  );
}

export function staggerReveal(selector: string, trigger: string, delay = 0, stagger = 0.08): void {
  const els  = document.querySelectorAll<HTMLElement>(selector);
  const trig = document.querySelector<HTMLElement>(trigger);
  if (!els.length || !trig) return;

  ScrollTrigger.create({
    trigger: trig, start: 'top 88%', once: true,
    onEnter: () => gsap.fromTo(els,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: DUR.md, ease: EASE.expo, stagger, delay, clearProps: 'will-change' },
    ),
  });
}

// Draws left→right; transformOrigin must stay 'left center'
export function lineReveal(selector: string, delay = 0): void {
  document.querySelectorAll<HTMLElement>(selector).forEach(el => {
    gsap.fromTo(el,
      { scaleX: 0, transformOrigin: 'left center' },
      { scaleX: 1, duration: DUR.md, ease: EASE.expo, delay, clearProps: 'will-change' },
    );
  });
}

export function sequenceReveal(items: { selector: string; delay: number; y?: number }[]): void {
  items.forEach(({ selector, delay, y = 18 }) => {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) return;
    gsap.fromTo(el,
      { opacity: 0, y },
      { opacity: 1, y: 0, duration: DUR.md, ease: EASE.expo, delay, clearProps: 'will-change' },
    );
  });
}

export function heroParallax(selector: string, strength = 14): void {
  const img = document.querySelector<HTMLElement>(selector);
  if (!img) return;

  if (_morphed) {
    gsap.set(img, { opacity: 1, scale: 1.12 });
  } else {
    gsap.fromTo(img,
      { opacity: 0, scale: 1.18 },
      { opacity: 1, scale: 1.12, duration: DUR.xl + 0.4, ease: 'power3.out' },
    );
  }

  ScrollTrigger.create({
    trigger: document.documentElement, start: 'top top', end: 'bottom top', scrub: 2,
    onUpdate: st => gsap.set(img, { yPercent: -st.progress * strength }),
  });
}

export function imageEntrance(selector: string): void {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return;
  if (_morphed) { gsap.set(el, { opacity: 1, scale: 1 }); return; }
  gsap.fromTo(el,
    { opacity: 0, scale: 1.05 },
    { opacity: 1, scale: 1, duration: DUR.lg + 0.2, ease: 'power3.out' },
  );
}

// Lookbook spreads — each hero image parallaxes against its caption
export function chapterParallax(): void {
  document.querySelectorAll<HTMLElement>('.spread-hero').forEach(hero => {
    const img = hero.querySelector<HTMLElement>('.spread-img');
    const cap = hero.querySelector<HTMLElement>('.spread-cap');
    if (!img) return;
    gsap.set(img, { scale: 1.16 });
    ScrollTrigger.create({
      trigger: hero, start: 'top bottom', end: 'bottom top', scrub: 1.8,
      onUpdate: st => {
        gsap.set(img, { yPercent: -14 * st.progress });
        if (cap) gsap.set(cap, { yPercent: 4 * st.progress });
      },
    });
  });
}

export function cardsCascade(selector = '.pc'): void {
  const cards = document.querySelectorAll<HTMLElement>(selector);
  if (!cards.length) return;
  gsap.fromTo(cards,
    { opacity: 0, y: 32, scale: 0.98 },
    { opacity: 1, y: 0, scale: 1,
      duration: DUR.md, ease: EASE.expo,
      stagger: { amount: 0.5, from: 'start' },
      clearProps: 'will-change,scale' },
  );
}

// About page — numbered statements animate number then body in sequence
export function statementReveal(): void {
  document.querySelectorAll<HTMLElement>('[data-anim="statement"]').forEach(el => {
    const num  = el.querySelector<HTMLElement>('.stmt-num');
    const body = el.querySelectorAll<HTMLElement>('.stmt-h, .stmt-p');
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => {
        const tl = gsap.timeline();
        if (num) tl.fromTo(num, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: DUR.sm, ease: EASE.expo }, 0);
        tl.fromTo(body, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: DUR.md, ease: EASE.expo, stagger: 0.1 }, 0.05);
      },
    });
  });
}

export function pullQuote(selector: string): void {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return;
  ScrollTrigger.create({
    trigger: el, start: 'top 88%', once: true,
    onEnter: () => gsap.fromTo(el,
      { opacity: 0, y: 24, skewY: 1 },
      { opacity: 1, y: 0, skewY: 0, duration: DUR.lg, ease: EASE.expo, clearProps: 'skewY' },
    ),
  });
}

