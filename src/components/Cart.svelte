<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { lockScroll, unlockScroll } from '../lib/scrollLock';

  function slideRight(node: Element, { duration = 400 } = {}) {
    return {
      duration,
      easing: cubicOut,
      // GPU-composited transform only — no opacity to avoid backdrop interaction
      css: (t: number) => `
        transform: translateX(${(1 - t) * 100}%);
        will-change: transform;
      `,
    };
  }

  type CartItem = {
    slug:  string;
    name:  string;
    price: string;
    size:  string;
    img:   string;
    num:   string;
  };

  let open  = $state(false);
  let items = $state<CartItem[]>([]);

  const KEY = 'vh-cart';

  const save  = () => localStorage.setItem(KEY, JSON.stringify(items));
  const total = $derived(
    items.reduce((s, i) => s + parseFloat(i.price.replace(',', '')), 0)
      .toLocaleString('en-US', { minimumFractionDigits: 0 })
  );

  // Focus management
  let panelEl: HTMLElement;
  let lastFocused: HTMLElement | null = null;

  async function openCart() {
    lastFocused = document.activeElement as HTMLElement;
    open = true;
    lockScroll();
    await tick();
    panelEl?.querySelector<HTMLElement>('button, [href], [tabindex]')?.focus();
  }

  function closeCart() {
    open = false;
    unlockScroll();
    lastFocused?.focus();
  }

  onMount(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) items = JSON.parse(saved);
    } catch {}

    window.addEventListener('vh:add-to-cart', (e: Event) => {
      const item = (e as CustomEvent<CartItem>).detail;
      if (!items.find(i => i.slug === item.slug && i.size === item.size)) {
        items = [...items, item];
        save();
        window.dispatchEvent(new Event('vh:cart-updated'));
      }
      openCart();
    });

    window.addEventListener('vh:open-cart', openCart);
  });

  function remove(slug: string, size: string) {
    items = items.filter(i => !(i.slug === slug && i.size === size));
    save();
    window.dispatchEvent(new Event('vh:cart-updated'));
  }

  // Focus trap
  function trapFocus(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === 'Escape') { closeCart(); return; }
    if (e.key !== 'Tab') return;

    const focusable = panelEl?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable?.length) return;

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }
</script>

<svelte:window onkeydown={trapFocus} />

{#if open}
  <div
    class="backdrop"
    style="--backdrop-z:400; background:rgb(28 27 25/0.4)"
    role="presentation"
    onclick={closeCart}
    transition:fade={{ duration: 350 }}
  ></div>

  <!-- Panel — slide in from right / slide out to right -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="cart-panel"
    role="dialog"
    aria-modal="true"
    aria-label="Your selection"
    bind:this={panelEl}
    transition:slideRight={{ duration: 400 }}
  >
    <!-- Header -->
    <div class="cart-header">
      <span class="label">Selection ({items.length})</span>
      <button class="label ghost-btn" onclick={closeCart} aria-label="Close selection">
        Close
      </button>
    </div>
    <div class="rule"></div>

    {#if items.length === 0}
      <!-- Empty state -->
      <div class="cart-empty">
        <p class="empty-msg">Your selection is empty.</p>
        <a href="/collection" class="label empty-link" onclick={closeCart}>
          Browse Collection →
        </a>
      </div>
    {:else}
      <!-- Items -->
      <ul class="cart-items" role="list">
        {#each items as item (item.slug + item.size)}
          <li class="cart-item">
            <a href={`/product/${item.slug}`} class="item-img-link" onclick={closeCart}>
              <div class="item-img-wrap">
                <img
                  class="item-img"
                  src={item.img}
                  alt={item.name}
                  width="200" height="267"
                  decoding="async"
                />
              </div>
            </a>
            <div class="item-body">
              <div class="item-top">
                <div class="item-meta">
                  <span class="label op-30">{item.num}</span>
                  <span class="item-name">{item.name}</span>
                  <span class="label item-size">Size {item.size}</span>
                </div>
                <button
                  class="label ghost-btn"
                  onclick={() => remove(item.slug, item.size)}
                  aria-label={`Remove ${item.name}, size ${item.size}`}
                  title="Remove item"
                >
                  Remove
                </button>
              </div>
              <span class="label item-price">€ {item.price}</span>
            </div>
          </li>
          <div class="rule"></div>
        {/each}
      </ul>

      <!-- Footer -->
      <div class="cart-footer">
        <div class="total-row">
          <span class="label muted">Estimated total</span>
          <span class="total-amount serif">€ {total}</span>
        </div>
        <p class="label muted ship-note">Complimentary worldwide shipping · Duty-free</p>
        <button class="checkout-btn label">
          Complete Selection
        </button>
      </div>
    {/if}
  </div>
{/if}

<style>
  /* Panel — transition handled by Svelte slideRight() */
  .cart-panel {
    position: fixed;
    inset-block: 0;
    inset-inline-end: 0;
    width: min(420px, 100vw);
    background: var(--color-white);
    z-index: 401;
    display: flex;
    flex-direction: column;
    border-left: 1px solid var(--color-rule);
    /* Stable compositing layer — avoids paint during slide */
    will-change: transform;
    /* Prevent subpixel rendering bleed at the left border */
    backface-visibility: hidden;
  }

  /* Header */
  .cart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem 1.5rem 1.25rem;
  }

  /* Empty state */
  .cart-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    padding: 3rem 1.5rem;
    text-align: center;
  }

  .empty-msg {
    font-size: 0.875rem;
    font-variation-settings: 'wght' 300;
    color: var(--color-soft);
    line-height: 1.6;
  }

  .empty-link {
    color: var(--color-ink);
    opacity: 0.5;
    transition: opacity 0.2s;
    border-bottom: 1px solid var(--color-rule);
    padding-bottom: 0.1rem;
  }
  .empty-link:hover { opacity: 1; }

  /* Items */
  .cart-items {
    flex: 1;
    overflow-y: auto;
    list-style: none;
    padding: 0;
    /* Subtle scroll shadow */
    background:
      linear-gradient(var(--color-white) 30%, transparent),
      linear-gradient(transparent, var(--color-white) 70%) bottom,
      radial-gradient(farthest-side at 50% 0, rgb(28 27 25 / 0.08), transparent),
      radial-gradient(farthest-side at 50% 100%, rgb(28 27 25 / 0.08), transparent) bottom;
    background-repeat: no-repeat;
    background-size: 100% 40px, 100% 40px, 100% 10px, 100% 10px;
    background-attachment: local, local, scroll, scroll;
  }

  .cart-item {
    display: grid;
    grid-template-columns: 80px 1fr;
    gap: 1.25rem;
    padding: 1.25rem 1.5rem;
    align-items: start;
  }

  .item-img-link { display: block; }

  .item-img-wrap {
    aspect-ratio: 3/4;
    overflow: hidden;
    background: var(--color-off);
  }
  .item-img {
    width: 100%; height: 100%;
    object-fit: cover; object-position: center top;
    display: block;
    transition: opacity 0.3s;
  }
  .item-img-link:hover .item-img { opacity: 0.8; }

  .item-body {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 1rem;
    padding-block: 0.25rem;
    min-height: 100%;
  }

  .item-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .item-meta { display: flex; flex-direction: column; gap: 0.25rem; }

  .item-name {
    font-size: 0.8125rem;
    font-variation-settings: 'wght' 300;
    color: var(--color-ink);
    line-height: 1.3;
  }

  .item-size {
    opacity: 0.4;
    text-transform: none;
    letter-spacing: 0.04em;
  }

  .item-price { opacity: 0.5; }

  /* Footer */
  .cart-footer {
    padding: 1.25rem 1.5rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border-top: 1px solid var(--color-rule);
  }

  .total-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding-block: 0.5rem;
  }

  .total-amount {
    font-size: 1.5rem;
    font-style: italic;
    font-variation-settings: 'wght' 400;
    color: var(--color-ink);
  }

  .ship-note { text-align: center; }

  .checkout-btn {
    width: 100%;
    background: var(--color-ink);
    color: var(--color-white);
    border: none;
    padding: 1rem;
    letter-spacing: 0.2em;
    transition: background 0.2s;
  }
  .checkout-btn:hover { background: var(--color-ink-soft); }
</style>
