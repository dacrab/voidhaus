let depth     = 0;
let savedTop  = 0;

export function lockScroll(): void {
  if (depth === 0) {
    savedTop = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.top      = `-${savedTop}px`;
    document.body.style.position = 'fixed';
    document.body.style.width    = '100%';
  }
  depth++;
}

export function unlockScroll(): void {
  depth = Math.max(0, depth - 1);
  if (depth === 0) {
    document.body.style.overflow = '';
    document.body.style.top      = '';
    document.body.style.position = '';
    document.body.style.width    = '';
    window.scrollTo({ top: savedTop, behavior: 'instant' });
  }
}
