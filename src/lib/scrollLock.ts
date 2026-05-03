export function lockScroll(): void {
  document.body.style.top = `-${window.scrollY}px`;
  document.body.classList.add('scroll-locked');
}

export function unlockScroll(): void {
  const top = parseInt(document.body.style.top || '0') * -1;
  document.body.classList.remove('scroll-locked');
  document.body.style.top = '';
  window.scrollTo(0, top);
}
