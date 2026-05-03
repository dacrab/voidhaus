import { lockScroll, unlockScroll } from './scrollLock';
import { trapFocus } from './focusTrap';

export function createModal() {
  let prevFocus: HTMLElement | null = null;

  function open(panelEl?: HTMLElement) {
    prevFocus = document.activeElement as HTMLElement;
    lockScroll();
    if (panelEl) {
      requestAnimationFrame(() => {
        panelEl.querySelector<HTMLElement>('button,[href],[tabindex]')?.focus();
      });
    }
  }

  function close() {
    unlockScroll();
    prevFocus?.focus();
  }

  function handleKeydown(panelEl: HTMLElement | undefined, e: KeyboardEvent) {
    if (!panelEl) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      return true; // signal to close
    }
    trapFocus(panelEl, e);
    return false;
  }

  return { open, close, handleKeydown };
}

export function slideIn(_node: Element) {
  return {
    duration: 400,
    css: (t: number) => `transform:translateX(${(1 - t) * 100}%)`,
  };
}

export function panelIn(_node: Element, { y = -1.5, scale = false } = {}) {
  return {
    duration: 400,
    css: (t: number) => {
      const transform = scale 
        ? `translateY(${(1 - t) * y}rem) scale(${0.98 + t * 0.02})`
        : `translateY(${(1 - t) * y}rem)`;
      return `opacity:${t}; transform:${transform}`;
    },
  };
}
