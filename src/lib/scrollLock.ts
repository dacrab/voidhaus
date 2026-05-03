let savedTop = 0;

export function lockScroll(): void {
  savedTop = window.scrollY;
  document.body.style.top = `-${savedTop}px`;
  document.body.classList.add('scroll-locked');
}

export function unlockScroll(): void {
  document.body.classList.remove('scroll-locked');
  document.body.style.top = '';
  window.scrollTo({ top: savedTop, behavior: 'instant' });
}
