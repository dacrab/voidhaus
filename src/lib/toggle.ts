export function initToggleGroup(selector: string, onChange?: (el: HTMLElement) => void): () => void {
  const items = document.querySelectorAll<HTMLElement>(selector);
  const handlers: Array<() => void> = [];

  items.forEach(item => {
    const handler = () => {
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      onChange?.(item);
    };
    item.addEventListener('click', handler);
    handlers.push(() => item.removeEventListener('click', handler));
  });

  return () => handlers.forEach(cleanup => cleanup());
}
