export function observeAnimations(): () => void {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -80px 0px" },
  );

  document.querySelectorAll('[data-anim="scroll"], [data-anim="stagger"]').forEach((el) => {
    observer.observe(el);
  });

  document.querySelectorAll('[data-anim="hero"]').forEach((el, i) => {
    const delay = parseFloat(el.getAttribute("data-delay") ?? "") || i * 0.12;
    setTimeout(() => el.classList.add("in-view"), (delay + 0.15) * 1000);
  });

  return () => observer.disconnect();
}
