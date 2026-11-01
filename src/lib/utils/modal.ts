import { prefersReducedMotion } from "./motion.js";

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

function trapFocus(container: HTMLElement, event: KeyboardEvent): void {
  if (event.key !== "Tab") return;
  const focusable = [...container.querySelectorAll<HTMLElement>(FOCUSABLE)];
  const first = focusable[0];
  const last = focusable.at(-1);
  if (!(first && last)) return;

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

export function createModal() {
  let previousFocus: HTMLElement | null = null;
  let previousOverflow = "";

  function open(panel?: HTMLElement): void {
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (panel) {
      requestAnimationFrame(() => panel.querySelector<HTMLElement>(FOCUSABLE)?.focus());
    }
  }

  function close(): void {
    document.body.style.overflow = previousOverflow;
    previousFocus?.focus();
  }

  function handleKeydown(panel: HTMLElement | undefined, event: KeyboardEvent): boolean {
    if (!panel) return false;
    if (event.key === "Escape") {
      event.preventDefault();
      return true;
    }
    trapFocus(panel, event);
    return false;
  }

  return { open, close, handleKeydown };
}

export function slideIn(_: Element) {
  if (prefersReducedMotion()) return { duration: 0 };
  return {
    duration: 550,
    css: (t: number) => `transform:translateX(${(1 - t) * 100}%)`,
  };
}

export function panelIn(_: Element, { y = -1.5, scale = false } = {}) {
  if (prefersReducedMotion()) return { duration: 0 };
  return {
    duration: 550,
    css: (t: number) => {
      const transform = scale
        ? `translateY(${(1 - t) * y}rem) scale(${0.98 + t * 0.02})`
        : `translateY(${(1 - t) * y}rem)`;
      return `opacity:${t}; transform:${transform}`;
    },
  };
}
