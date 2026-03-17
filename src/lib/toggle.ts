/**
 * Initialise a mutually-exclusive toggle group.
 * One item active at a time; clicks remove .active from siblings.
 */
export function initToggleGroup(
  selector: string,
  onChange?: (el: HTMLElement) => void,
): void {
  const items = document.querySelectorAll<HTMLElement>(selector);
  items.forEach(item => {
    item.addEventListener('click', () => {
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      onChange?.(item);
    });
  });
}
