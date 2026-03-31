let count = 0;

export function lockScroll(): void {
  if (++count === 1) document.body.style.overflow = 'hidden';
}

export function unlockScroll(): void {
  if (--count <= 0) { count = 0; document.body.style.overflow = ''; }
}
