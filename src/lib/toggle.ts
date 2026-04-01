export function initToggleGroup(selector: string, onChange?: (el: HTMLElement) => void): () => void {
  const items = [...document.querySelectorAll<HTMLElement>(selector)];
  const handlers: Array<() => void> = [];

  for (const item of items) {
    const handler = () => {
      for (const i of items) {
        i.classList.remove('active');
        if (i.hasAttribute('aria-pressed')) i.setAttribute('aria-pressed', 'false');
      }
      item.classList.add('active');
      if (item.hasAttribute('aria-pressed')) item.setAttribute('aria-pressed', 'true');
      onChange?.(item);
    };
    item.addEventListener('click', handler);
    handlers.push(() => item.removeEventListener('click', handler));
  }

  return () => handlers.forEach(fn => fn());
}
