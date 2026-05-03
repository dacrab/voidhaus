import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
gsap.config({ force3D: true });

export { gsap };
export const EASE = { out: 'power2.out', in: 'power2.in', io: 'power2.inOut', expo: 'expo.out', circ: 'circ.out' };

const getToken = (name: string) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
export const DUR = {
  get xs() { return getToken('--duration-fast'); },
  get sm() { return getToken('--duration-base'); },
  get md() { return getToken('--duration-slow'); },
  get lg() { return getToken('--duration-slower'); },
  get xl() { return getToken('--duration-slowest'); },
  get slower() { return getToken('--duration-slower'); },
};
export const STAGGER = {
  get base() { return getToken('--stagger-base'); },
};

document.addEventListener('astro:before-swap', () => { ScrollTrigger.getAll().forEach(t => t.kill()); });

export function reveal(): void {
  ScrollTrigger.refresh();

  document.querySelectorAll<HTMLElement>('[data-anim="hero"]').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 22 },
      { opacity: 1, y: 0, duration: DUR.slower, ease: EASE.expo,
        delay: parseFloat(el.dataset.delay ?? '0') || 0, clearProps: 'will-change' },
    );
  });

  ScrollTrigger.batch('[data-anim="scroll"]', {
    start: 'top 90%', once: true,
    onEnter: els => gsap.fromTo(els,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: DUR.slower, ease: EASE.expo, stagger: STAGGER.base, clearProps: 'will-change' },
    ),
  });

  ScrollTrigger.batch('[data-anim="stagger"]', {
    start: 'top 92%', once: true,
    onEnter: els => gsap.fromTo(els,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: DUR.slower, ease: EASE.expo, stagger: STAGGER.base, clearProps: 'will-change' },
    ),
  });
}

export function lineReveal(selector: string, delay = 0): void {
  document.querySelectorAll<HTMLElement>(selector).forEach(el => {
    gsap.fromTo(el,
      { scaleX: 0, transformOrigin: 'left center' },
      { scaleX: 1, duration: DUR.slower, ease: EASE.expo, delay, clearProps: 'will-change' },
    );
  });
}

export function cardsCascade(selector = '.pc'): void {
  const cards = document.querySelectorAll<HTMLElement>(selector);
  if (!cards.length) return;
  gsap.fromTo(cards,
    { opacity: 0, y: 32, scale: 0.98 },
    { opacity: 1, y: 0, scale: 1,
      duration: DUR.slower, ease: EASE.expo,
      stagger: { amount: 0.5, from: 'start' },
      clearProps: 'will-change,scale' },
  );
}
