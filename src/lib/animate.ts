import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
gsap.config({ force3D: true });

export { gsap };
export const EASE = { expo: 'expo.out' };
export const DUR = { instant: 0.3, fast: 0.4, sm: 0.5, base: 0.6, md: 0.6, slower: 0.8, lg: 0.8 };

document.addEventListener('astro:before-swap', () => { 
  ScrollTrigger.getAll().forEach(t => t.kill()); 
});

export function reveal(): void {
  ScrollTrigger.refresh();

  // Hero elements (immediate on page load)
  document.querySelectorAll<HTMLElement>('[data-anim="hero"]').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 24 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 1, 
        ease: EASE.expo,
        delay: parseFloat(el.dataset.delay ?? '0') || 0, 
        clearProps: 'will-change' 
      },
    );
  });

  // Scroll-triggered elements
  ScrollTrigger.batch('[data-anim="scroll"]', {
    start: 'top 85%', 
    once: true,
    onEnter: els => gsap.fromTo(els,
      { opacity: 0, y: 32 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 1, 
        ease: EASE.expo, 
        stagger: 0.08, 
        clearProps: 'will-change' 
      },
    ),
  });

  // Staggered children
  ScrollTrigger.batch('[data-anim="stagger"]', {
    start: 'top 88%', 
    once: true,
    onEnter: els => gsap.fromTo(els,
      { opacity: 0, y: 24 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.9, 
        ease: EASE.expo, 
        stagger: 0.06, 
        clearProps: 'will-change' 
      },
    ),
  });
}

export function lineReveal(selector: string, delay = 0): void {
  document.querySelectorAll<HTMLElement>(selector).forEach(el => {
    gsap.fromTo(el,
      { scaleX: 0, transformOrigin: 'left center' },
      { 
        scaleX: 1, 
        duration: 1.2, 
        ease: EASE.expo, 
        delay, 
        clearProps: 'will-change' 
      },
    );
  });
}

export function cardsCascade(selector = '.pc'): void {
  const cards = document.querySelectorAll<HTMLElement>(selector);
  if (!cards.length) return;
  
  gsap.fromTo(cards,
    { opacity: 0, y: 40, scale: 0.97 },
    { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      duration: 1.1, 
      ease: EASE.expo,
      stagger: { amount: 0.4, from: 'start' },
      clearProps: 'will-change,scale' 
    },
  );
}

export function onReady(callback: () => void): void {
  Promise.race([document.fonts.ready, new Promise<void>(r => setTimeout(r, 300))])
    .then(() => requestAnimationFrame(() => requestAnimationFrame(callback)));
}
