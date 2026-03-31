import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Shared GSAP config — smooth defaults
gsap.defaults({ ease: 'power2.out', overwrite: 'auto' });
gsap.config({ force3D: true });

const EASE = 'power2.out';
const DUR  = { base: 0.65, slow: 0.9 };

// Per-page GSAP context — enables clean kill on navigation
let _ctx: gsap.Context | null = null;

// Kill all ScrollTriggers & tweens from the previous page before the swap
// astro:before-swap is the right moment — DOM is still the old page
document.addEventListener('astro:before-swap', () => {
  _ctx?.revert();
  _ctx = null;
});

// True when this navigation used the View Transition API morph
// Detected reliably on astro:page-load via the data-astro-transition-fallback attribute
// or by checking if the VT API was actually used (set during astro:after-swap)
let _morphed = false;
document.addEventListener('astro:after-swap', () => {
  // After swap the new HTML is in place; the VT is running if supported
  _morphed = !!(document as any).startViewTransition || document.documentElement.hasAttribute('data-astro-transition');
});

// Public helper — did the last nav use a VT morph?
function didMorph(): boolean {
  return _morphed;
}

/**
 * Run cb after fonts are ready AND the view-transition has completed painting.
 * Uses astro:page-load which fires after the new page is fully visible —
 * the correct replacement for DOMContentLoaded with ClientRouter.
 */
export function onReady(cb: () => void): void {
  // Create a fresh GSAP context for this page
  _ctx = gsap.context(() => {});

  const run = () => {
    // Double-rAF: ensures layout is settled before we read/write geometry
    requestAnimationFrame(() => requestAnimationFrame(cb));
  };

  // Fonts or 300 ms — whichever comes first (avoid blocking on slow font loads)
  Promise.race([
    document.fonts.ready,
    new Promise<void>(res => setTimeout(res, 300)),
  ]).then(run);
}

export function reveal(): void {
  // Refresh after layout is stable
  ScrollTrigger.refresh();

  document.querySelectorAll<HTMLElement>('[data-anim="hero"]').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 18, willChange: 'opacity, transform' },
      {
        opacity: 1, y: 0,
        duration: DUR.slow, ease: EASE,
        delay: Number(el.dataset.delay ?? 0),
        clearProps: 'willChange',
      },
    );
  });

  ScrollTrigger.batch('[data-anim="scroll"]', {
    start: 'top 92%', once: true,
    onEnter: els => gsap.fromTo(els,
      { opacity: 0, y: 24, willChange: 'opacity, transform' },
      {
        opacity: 1, y: 0,
        duration: DUR.base, ease: EASE, stagger: 0.07,
        clearProps: 'willChange',
      },
    ),
  });
}

export function staggerReveal(selector: string, trigger: string, delay = 0, stagger = 0.08): void {
  const els  = document.querySelectorAll<HTMLElement>(selector);
  const trig = document.querySelector<HTMLElement>(trigger);
  if (!els.length || !trig) return;

  ScrollTrigger.create({
    trigger: trig, start: 'top 90%', once: true,
    onEnter: () => gsap.fromTo(els,
      { opacity: 0, y: 20, willChange: 'opacity, transform' },
      {
        opacity: 1, y: 0,
        duration: DUR.base, ease: EASE, stagger, delay,
        clearProps: 'willChange',
      },
    ),
  });
}

export function heroParallax(selector: string, strength = 15): void {
  const img = document.querySelector<HTMLElement>(selector);
  if (!img) return;

  if (!didMorph()) {
    // Fresh load — animate in from hidden
    gsap.fromTo(img,
      { opacity: 0, scale: 1.2, willChange: 'opacity, transform' },
      { opacity: 1, scale: 1.14, duration: 1.8, ease: 'power3.out', clearProps: 'willChange' },
    );
  } else {
    // Arrived via VT morph — snap directly to parallax start state
    gsap.set(img, { opacity: 1, scale: 1.14 });
  }

  ScrollTrigger.create({
    trigger: document.documentElement, start: 'top top', end: 'bottom top',
    scrub: 2,
    onUpdate: st => gsap.set(img, { yPercent: -st.progress * strength }),
  });
}

/**
 * Animate image in — skipped when a VT morph already handled the entrance.
 */
export function imageEntrance(selector: string): void {
  if (didMorph()) {
    // Ensure the image is fully visible after VT
    const el = document.querySelector<HTMLElement>(selector);
    if (el) gsap.set(el, { opacity: 1, scale: 1, clearProps: 'opacity,scale' });
    return;
  }
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return;
  gsap.fromTo(el,
    { opacity: 0, scale: 1.06, willChange: 'opacity, transform' },
    { opacity: 1, scale: 1, duration: 1.4, ease: 'power3.out', clearProps: 'willChange' },
  );
}

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
