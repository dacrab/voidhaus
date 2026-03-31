import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);
gsap.config({ force3D: true });

// ── Constants ────────────────────────────────────────────────────────────────
const E  = { out: 'power2.out', in: 'power2.in', io: 'power2.inOut', expo: 'expo.out', circ: 'circ.out' };
const D  = { xs: 0.3, sm: 0.5, md: 0.7, lg: 1.0, xl: 1.4 };

// ── Page context — killed before each navigation ─────────────────────────────
let _ctx: gsap.Context | null = null;
let _morphed = false;

document.addEventListener('astro:before-swap', () => { _ctx?.revert(); _ctx = null; });
document.addEventListener('astro:after-swap',  () => {
  _morphed = document.documentElement.hasAttribute('data-astro-transition');
});

// ── onReady — run after fonts + layout settle ────────────────────────────────
export function onReady(cb: () => void): void {
  _ctx = gsap.context(() => {});
  Promise.race([document.fonts.ready, new Promise<void>(r => setTimeout(r, 300))])
    .then(() => requestAnimationFrame(() => requestAnimationFrame(cb)));
}

export const morphed = () => _morphed;

// ── reveal — hero + scroll batch ─────────────────────────────────────────────
export function reveal(): void {
  ScrollTrigger.refresh();

  document.querySelectorAll<HTMLElement>('[data-anim="hero"]').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 22 },
      { opacity: 1, y: 0, duration: D.md, ease: E.expo,
        delay: Number(el.dataset.delay ?? 0), clearProps: 'will-change' },
    );
  });

  ScrollTrigger.batch('[data-anim="scroll"]', {
    start: 'top 90%', once: true,
    onEnter: els => gsap.fromTo(els,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: D.md, ease: E.expo, stagger: 0.08, clearProps: 'will-change' },
    ),
  });
}

// ── titleReveal — large heading: opacity + y, optionally split by lines ───────
export function titleReveal(selector: string, delay = 0): void {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return;
  gsap.fromTo(el,
    { opacity: 0, y: 32, skewY: 1.5 },
    { opacity: 1, y: 0, skewY: 0, duration: D.lg, ease: E.expo, delay, clearProps: 'will-change,skewY' },
  );
}

// ── staggerReveal — stagger a group of elements into view ─────────────────────
export function staggerReveal(selector: string, trigger: string, delay = 0, stagger = 0.08): void {
  const els  = document.querySelectorAll<HTMLElement>(selector);
  const trig = document.querySelector<HTMLElement>(trigger);
  if (!els.length || !trig) return;

  ScrollTrigger.create({
    trigger: trig, start: 'top 88%', once: true,
    onEnter: () => gsap.fromTo(els,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: D.md, ease: E.expo, stagger, delay, clearProps: 'will-change' },
    ),
  });
}

// ── lineReveal — horizontal rule draws in left→right ─────────────────────────
export function lineReveal(selector: string, delay = 0): void {
  document.querySelectorAll<HTMLElement>(selector).forEach(el => {
    gsap.fromTo(el,
      { scaleX: 0, transformOrigin: 'left center' },
      { scaleX: 1, duration: D.md, ease: E.expo, delay, clearProps: 'will-change' },
    );
  });
}

// ── sequenceReveal — animate an ordered list of elements with precise timing ──
export function sequenceReveal(items: { selector: string; delay: number; y?: number }[]): void {
  items.forEach(({ selector, delay, y = 18 }) => {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) return;
    gsap.fromTo(el,
      { opacity: 0, y },
      { opacity: 1, y: 0, duration: D.md, ease: E.expo, delay, clearProps: 'will-change' },
    );
  });
}

// ── heroParallax — hero image entrance + scroll parallax ─────────────────────
export function heroParallax(selector: string, strength = 14): void {
  const img = document.querySelector<HTMLElement>(selector);
  if (!img) return;

  if (_morphed) {
    gsap.set(img, { opacity: 1, scale: 1.12 });
  } else {
    gsap.fromTo(img,
      { opacity: 0, scale: 1.18 },
      { opacity: 1, scale: 1.12, duration: D.xl + 0.4, ease: 'power3.out' },
    );
  }

  ScrollTrigger.create({
    trigger: document.documentElement, start: 'top top', end: 'bottom top', scrub: 2,
    onUpdate: st => gsap.set(img, { yPercent: -st.progress * strength }),
  });
}

// ── imageEntrance — product image fade+scale in ───────────────────────────────
export function imageEntrance(selector: string): void {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return;
  if (_morphed) { gsap.set(el, { opacity: 1, scale: 1 }); return; }
  gsap.fromTo(el,
    { opacity: 0, scale: 1.05 },
    { opacity: 1, scale: 1, duration: D.lg + 0.2, ease: 'power3.out' },
  );
}

// ── chapterParallax — lookbook spread parallax ────────────────────────────────
export function chapterParallax(): void {
  document.querySelectorAll<HTMLElement>('.spread-hero').forEach(hero => {
    const img = hero.querySelector<HTMLElement>('.spread-img, .spread-img img');
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

// ── cardsCascade — stagger product cards with subtle scale ────────────────────
export function cardsCascade(selector = '.pc'): void {
  const cards = document.querySelectorAll<HTMLElement>(selector);
  if (!cards.length) return;
  gsap.fromTo(cards,
    { opacity: 0, y: 32, scale: 0.98 },
    { opacity: 1, y: 0, scale: 1,
      duration: D.md, ease: E.expo,
      stagger: { amount: 0.5, from: 'start' },
      clearProps: 'will-change,scale' },
  );
}

// ── statementReveal — about-page numbered statements ─────────────────────────
export function statementReveal(): void {
  document.querySelectorAll<HTMLElement>('[data-anim="statement"]').forEach(el => {
    const num  = el.querySelector<HTMLElement>('.stmt-num');
    const body = el.querySelectorAll<HTMLElement>('.stmt-h, .stmt-p');
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => {
        const tl = gsap.timeline();
        if (num) tl.fromTo(num, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: D.sm, ease: E.expo }, 0);
        tl.fromTo(body, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: D.md, ease: E.expo, stagger: 0.1 }, 0.05);
      },
    });
  });
}

// ── pullQuote — serif pull-quote word-stagger ─────────────────────────────────
export function pullQuote(selector: string): void {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return;
  ScrollTrigger.create({
    trigger: el, start: 'top 88%', once: true,
    onEnter: () => gsap.fromTo(el,
      { opacity: 0, y: 24, skewY: 1 },
      { opacity: 1, y: 0, skewY: 0, duration: D.lg, ease: E.expo, clearProps: 'skewY' },
    ),
  });
}

// ── navEntrance — initial nav link reveal on first load ───────────────────────
export function navEntrance(): void {
  if (_morphed) return;
  gsap.fromTo('.nav-link',
    { opacity: 0, y: -6 },
    { opacity: 1, y: 0, duration: D.sm, ease: E.expo, stagger: 0.06, delay: 0.6 },
  );
}
