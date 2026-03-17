/**
 * VOIDHAUS — Animation system
 *
 * Rules:
 * - Text elements: opacity only — no transforms, no subpixel shift
 * - Images: scale/translate allowed — no clearProps on continuing transforms
 * - All animations wait for fonts via onReady()
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const EASE   = 'power2.out';
const DUR    = { base: 0.7, slow: 1.0, xslow: 1.4 };

// ── Wait for fonts, then run ───────────────────────────────────────────
export function onReady(cb: () => void): void {
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => requestAnimationFrame(cb));
  } else {
    requestAnimationFrame(cb);
  }
}

// ── Reveal ALL data-anim elements (hero + scroll) in one call ─────────
// data-anim="hero"   → fires immediately (no scroll trigger)
// data-anim="scroll" → fires on ScrollTrigger enter
export function reveal(): void {
  ScrollTrigger.refresh();

  // Hero elements — immediate opacity fade
  document.querySelectorAll<HTMLElement>('[data-anim="hero"]').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0 },
      {
        opacity:  1,
        duration: DUR.slow,
        ease:     EASE,
        delay:    Number(el.dataset.delay ?? 0),
      }
    );
  });

  // Scroll elements — fade on enter
  document.querySelectorAll<HTMLElement>('[data-anim="scroll"]').forEach(el => {
    // Already in viewport — show immediately
    if (el.getBoundingClientRect().top < window.innerHeight) {
      gsap.set(el, { opacity: 1 });
      return;
    }

    ScrollTrigger.create({
      trigger: el,
      start:   'top 92%',
      once:    true,
      onEnter: () => gsap.to(el, {
        opacity:  1,
        duration: DUR.base,
        ease:     EASE,
        delay:    Number(el.dataset.delay ?? 0),
      }),
    });
  });
}

// ── Stagger group on scroll ────────────────────────────────────────────
export function staggerReveal(
  selector: string,
  trigger:  string,
  delay     = 0,
  stagger   = 0.08,
): void {
  const els  = gsap.utils.toArray<HTMLElement>(selector);
  const trig = document.querySelector<HTMLElement>(trigger);
  if (!els.length || !trig) return;

  els.forEach(el => gsap.set(el, { opacity: 0 }));

  ScrollTrigger.create({
    trigger: trig,
    start:   'top 90%',
    once:    true,
    onEnter: () => gsap.to(els, {
      opacity: 1, duration: DUR.base, ease: EASE, stagger, delay,
    }),
  });
}

// ── Hero image: entrance + scroll parallax ────────────────────────────
export function heroParallax(selector: string, strength = 15): void {
  const img = document.querySelector<HTMLElement>(selector);
  if (!img) return;

  // GSAP owns this transform permanently — no clearProps ever
  gsap.set(img, { scale: 1.14 });
  gsap.fromTo(img,
    { opacity: 0, scale: 1.2 },
    { opacity: 1, scale: 1.14, duration: 1.8, ease: 'power2.out' }
  );

  ScrollTrigger.create({
    trigger:  document.documentElement,
    start:    'top top',
    end:      'bottom top',
    scrub:    1.5,
    onUpdate: st => gsap.set(img, { yPercent: -st.progress * strength, overwrite: 'auto' }),
  });
}

// ── Product image entrance ────────────────────────────────────────────
export function imageEntrance(selector: string): void {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return;
  gsap.set(el, { opacity: 0, scale: 1.06 });
  gsap.to(el, { opacity: 1, scale: 1, duration: 1.6, ease: 'power3.out' });
}

// ── Lookbook chapter parallax ─────────────────────────────────────────
export function chapterParallax(): void {
  document.querySelectorAll<HTMLElement>('.spread-hero').forEach(hero => {
    const img = hero.querySelector<HTMLElement>('.spread-img');
    const cap = hero.querySelector<HTMLElement>('.spread-cap');
    if (!img) return;

    gsap.set(img, { scale: 1.18, transformOrigin: 'center center' });

    ScrollTrigger.create({
      trigger: hero, start: 'top bottom', end: 'bottom top', scrub: 1.2,
      onUpdate: st => gsap.set(img, { yPercent: -16 * st.progress, overwrite: 'auto' }),
    });

    if (cap) {
      ScrollTrigger.create({
        trigger: hero, start: 'top bottom', end: 'bottom top', scrub: 2,
        onUpdate: st => gsap.set(cap, { yPercent: 5 * st.progress, overwrite: 'auto' }),
      });
    }
  });
}
