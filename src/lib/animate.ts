/**
 * VOIDHAUS — Animation system v3
 *
 * Core principle: OPACITY ONLY for text reveals.
 * No translateY. No transforms on text. Ever.
 *
 * Why: Any Y-axis animation on text (even 1px) causes subpixel
 * rounding artifacts when the transform is removed, making text
 * appear to "jump" or "shift". Luxury sites use pure opacity fades
 * (Louis Vuitton, The Row, Lemaire) — the restraint IS the design.
 *
 * Transforms are only used for:
 * - Images (scale on entrance, parallax scroll)
 * - Cards (very subtle scale on group reveal)
 * - Never on text elements
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ── Constants ──────────────────────────────────────────────────────────
const EASE = 'power2.out';
const DUR  = { fast: 0.5, base: 0.8, slow: 1.1 };

// ── Wait for fonts before any animation ───────────────────────────────
export function onReady(cb: () => void): void {
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => requestAnimationFrame(cb));
  } else {
    requestAnimationFrame(cb);
  }
}

// ── Hero: fade in elements on load, no movement ───────────────────────
export function revealHero(): void {
  const els = document.querySelectorAll<HTMLElement>('[data-anim="hero"]');
  els.forEach(el => {
    const delay = Number(el.dataset.delay ?? 0);
    gsap.fromTo(el,
      { opacity: 0 },
      { opacity: 1, duration: DUR.slow, ease: EASE, delay }
    );
  });
}

// ── Scroll: fade in on enter, no movement ─────────────────────────────
export function revealOnScroll(): void {
  ScrollTrigger.refresh();

  document.querySelectorAll<HTMLElement>('[data-anim="scroll"]').forEach(el => {
    // Already visible (e.g. above fold) — skip
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      gsap.set(el, { opacity: 1 });
      return;
    }

    gsap.set(el, { opacity: 0 });

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

// ── Stagger group: fade in children on scroll ─────────────────────────
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
      opacity:  1,
      duration: DUR.base,
      ease:     EASE,
      stagger,
      delay,
    }),
  });
}

// ── Hero image: scale entrance + scroll parallax ───────────────────────
// Single continuous GSAP context — no clearProps gap between entrance + parallax
export function heroParallax(selector: string, strength = 15): void {
  const img = document.querySelector<HTMLElement>(selector);
  if (!img) return;

  // Set oversized scale upfront so edges never show
  // 1.14 = enough room for both entrance animation and parallax travel
  gsap.set(img, { scale: 1.14, yPercent: 0 });

  // Entrance: animate from slightly more scaled to 1.14 (not to 1.0)
  // This way the transform is always live — no clearProps, no snap
  gsap.fromTo(img,
    { opacity: 0, scale: 1.2 },
    { opacity: 1, scale: 1.14, duration: 1.8, ease: 'power2.out' }
  );

  // Parallax scrub — runs continuously, transform always owned by GSAP
  ScrollTrigger.create({
    trigger:  document.documentElement,
    start:    'top top',
    end:      'bottom top',
    scrub:    1.5,
    onUpdate: st => gsap.set(img, {
      yPercent:  -st.progress * strength,
      overwrite: 'auto',
    }),
  });
}

// ── Lookbook chapter parallax ─────────────────────────────────────────
export function chapterParallax(): void {
  document.querySelectorAll<HTMLElement>('.spread-hero').forEach(hero => {
    const img = hero.querySelector<HTMLElement>('.spread-img');
    const cap = hero.querySelector<HTMLElement>('.spread-cap');
    if (!img) return;

    // Set scale upfront — GSAP owns this transform permanently
    gsap.set(img, { scale: 1.18, yPercent: 0, transformOrigin: 'center center' });

    ScrollTrigger.create({
      trigger: hero,
      start:   'top bottom',
      end:     'bottom top',
      scrub:   1.2,
      onUpdate: st => gsap.set(img, {
        yPercent:  -16 * st.progress,
        overwrite: 'auto',
      }),
    });

    // Caption counter-parallax — opacity only on cap text, yPercent on cap container
    if (cap) {
      ScrollTrigger.create({
        trigger: hero,
        start:   'top bottom',
        end:     'bottom top',
        scrub:   2,
        onUpdate: st => gsap.set(cap, {
          yPercent:  5 * st.progress,
          overwrite: 'auto',
        }),
      });
    }
  });
}

// ── Product image entrance — opacity + scale, no clearProps ───────────
// Scale stays at 1 via GSAP ownership (not cleared back to CSS)
export function imageEntrance(selector: string): void {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return;

  // Set scale via GSAP first so it owns the transform
  gsap.set(el, { opacity: 0, scale: 1.06 });
  gsap.to(el, {
    opacity:  1,
    scale:    1,
    duration: 1.6,
    ease:     'power3.out',
    // No clearProps — GSAP keeps transform at scale(1), no snap to CSS
  });
}
