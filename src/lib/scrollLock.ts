let depth = 0;

export function lockScroll(): void {
  if (++depth === 1) document.body.style.overflow = 'hidden';
}

export function unlockScroll(): void {
  if (--depth <= 0) { depth = 0; document.body.style.overflow = ''; }
}
