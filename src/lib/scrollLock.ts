/**
 * Centralized scroll lock manager.
 * Tracks how many panels are open — only unlocks when all are closed.
 * Prevents race condition when multiple panels (Nav, Cart, ForSale) interact.
 */

let lockCount = 0;

export function lockScroll(): void {
  lockCount++;
  if (lockCount === 1) {
    document.body.style.overflow = 'hidden';
  }
}

export function unlockScroll(): void {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = '';
  }
}
