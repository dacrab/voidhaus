const FOCUSABLE = 'a,button,[tabindex]:not([tabindex="-1"])';

export function trapFocus(container: HTMLElement, e: KeyboardEvent): void {
  if (e.key !== 'Tab') return;
  const els = [...container.querySelectorAll<HTMLElement>(FOCUSABLE)];
  if (!els.length) return;
  const first = els[0];
  const last  = els[els.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}
