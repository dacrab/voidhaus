const SCROLL_SELECTOR = '[data-anim="scroll"], [data-anim="rule"]';
const HERO_SELECTOR = '[data-anim="hero"]';

export function observeAnimations(): () => void {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -80px 0px" },
  );

  for (const element of document.querySelectorAll(SCROLL_SELECTOR)) {
    observer.observe(element);
  }

  const timers = [...document.querySelectorAll<HTMLElement>(HERO_SELECTOR)].map((element, index) => {
    const delay = Number(element.dataset.delay) || index * 0.12;
    return setTimeout(() => element.classList.add("in-view"), (delay + 0.15) * 1000);
  });

  return () => {
    observer.disconnect();
    for (const timer of timers) clearTimeout(timer);
  };
}
