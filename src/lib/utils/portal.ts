/**
 * Move an overlay to the document body so no transformed ancestor can become
 * its containing block. Position-fixed dialogs must not be trapped inside a
 * revealed section (reveal transforms persist as identity matrices).
 */
export function portal(node: HTMLElement): { destroy: () => void } {
  document.body.appendChild(node);
  return {
    destroy() {
      node.remove();
    },
  };
}
