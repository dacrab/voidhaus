let depth = 0;

export function lockScroll(): void {
  depth++;
  if (depth === 1) document.body.style.overflow = 'hidden';
}

export function unlockScroll(): void {
  depth = Math.max(0, depth - 1);
  if (depth === 0) document.body.style.overflow = '';
}
