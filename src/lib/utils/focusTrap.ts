const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function trapFocus(container: HTMLElement, e: KeyboardEvent) {
  if (e.key !== "Tab") return;
  const els = [...container.querySelectorAll<HTMLElement>(FOCUSABLE)];
  if (!els.length) return;
  const active = document.activeElement;
  if (e.shiftKey && active === els[0]) {
    e.preventDefault();
    els[els.length - 1].focus();
  } else if (!e.shiftKey && active === els[els.length - 1]) {
    e.preventDefault();
    els[0].focus();
  }
}
