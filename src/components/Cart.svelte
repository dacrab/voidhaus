<script lang="ts">
  import { onMount } from 'svelte';

  type CartItem = {
    slug: string;
    name: string;
    price: string;
    size: string;
    img: string;
    num: string;
  };

  let open  = $state(false);
  let items = $state<CartItem[]>([]);

  // Persist to localStorage
  const STORAGE_KEY = 'vh-cart';

  onMount(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) items = JSON.parse(saved);
    } catch {}

    // Listen for add-to-cart events from product pages
    window.addEventListener('vh:add-to-cart', (e: Event) => {
      const item = (e as CustomEvent<CartItem>).detail;
      const exists = items.find(i => i.slug === item.slug && i.size === item.size);
      if (!exists) {
        items = [...items, item];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      }
      open = true;
    });

    // Listen for open-cart events
    window.addEventListener('vh:open-cart', () => { open = true; });
  });

  function remove(slug: string, size: string) {
    items = items.filter(i => !(i.slug === slug && i.size === size));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function close() { open = false; }

  const total = $derived(
    items.reduce((sum, i) => sum + parseFloat(i.price.replace(',', '')), 0)
      .toLocaleString('en-US')
  );
</script>

<!-- Drawer -->
{#if open}
  <!-- Backdrop -->
  <div class="backdrop" role="presentation" onclick={close}></div>

  <!-- Panel -->
  <div
    class="cart-panel"
    role="dialog"
    aria-modal="true"
    aria-label="Your selection"
  >
    <div class="cart-header">
      <span class="label">Selection ({items.length})</span>
      <button class="label close-btn" onclick={close} aria-label="Close">Close</button>
    </div>
    <div class="rule"></div>

    {#if items.length === 0}
      <div class="cart-empty">
        <p class="label" style="opacity:0.4">Your selection is empty.</p>
        <a href="/collection" class="label empty-link" onclick={close}>
          Browse Collection →
        </a>
      </div>
    {:else}
      <ul class="cart-items" role="list">
        {#each items as item (item.slug + item.size)}
          <li class="cart-item">
            <a href={`/product/${item.slug}`} class="item-img-wrap" onclick={close}>
              <img
                class="item-img"
                src={item.img.replace(/w=\d+/, 'w=200')}
                alt={item.name}
                width="200" height="267"
                loading="lazy"
                decoding="async"
              />
            </a>
            <div class="item-info">
              <div class="item-top">
                <div>
                  <span class="label item-num">{item.num}</span>
                  <span class="item-name">{item.name}</span>
                  <span class="label item-size">Size: {item.size}</span>
                </div>
                <button
                  class="label remove-btn"
                  onclick={() => remove(item.slug, item.size)}
                  aria-label={`Remove ${item.name}`}
                >
                  ×
                </button>
              </div>
              <span class="label item-price">€ {item.price}</span>
            </div>
          </li>
          <div class="rule"></div>
        {/each}
      </ul>

      <div class="cart-footer">
        <div class="total-row">
          <span class="label" style="opacity:0.4">Total</span>
          <span class="total-amount">€ {total}</span>
        </div>
        <button class="checkout-btn label">
          Proceed to Checkout
        </button>
        <p class="label" style="opacity:0.35; text-align:center;">
          Complimentary worldwide shipping
        </p>
      </div>
    {/if}
  </div>
{/if}

<style>
  /* Backdrop */
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgb(24 23 20 / 0.35);
    z-index: 200;
    animation: fade-in 0.3s ease both;
  }

  @keyframes fade-in { from { opacity: 0; } }

  /* Panel */
  .cart-panel {
    position: fixed;
    inset-block: 0;
    inset-inline-end: 0;
    width: min(420px, 100vw);
    background: var(--color-white);
    z-index: 201;
    display: flex;
    flex-direction: column;
    animation: slide-in 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
    overflow: hidden;
  }

  @keyframes slide-in {
    from { transform: translateX(100%); }
    to   { transform: translateX(0); }
  }

  /* Header */
  .cart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.75rem 1.5rem 1.25rem;
  }

  .close-btn {
    background: none;
    border: none;
    color: var(--color-ink);
    opacity: 0.4;
    transition: opacity 0.2s;
    padding: 0;
  }
  .close-btn:hover { opacity: 1; }

  /* Empty */
  .cart-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    padding: 3rem 1.5rem;
  }

  .empty-link {
    color: var(--color-ink);
    opacity: 0.5;
    transition: opacity 0.2s;
  }
  .empty-link:hover { opacity: 1; }

  /* Items */
  .cart-items {
    flex: 1;
    overflow-y: auto;
    scrollbar-width: none;
    list-style: none;
    padding: 0;
  }
  .cart-items::-webkit-scrollbar { display: none; }

  .cart-item {
    display: grid;
    grid-template-columns: 80px 1fr;
    gap: 1rem;
    padding: 1.25rem 1.5rem;
    align-items: start;
  }

  .item-img-wrap {
    aspect-ratio: 3/4;
    overflow: hidden;
    background: var(--color-off);
    display: block;
  }

  .item-img {
    width: 100%; height: 100%;
    object-fit: cover;
    object-position: center top;
    display: block;
    transition: transform 0.5s var(--ease-out);
  }
  .item-img-wrap:hover .item-img { transform: scale(1.04); }

  .item-info {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 0.75rem;
    min-height: 100%;
  }

  .item-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .item-num   { display: block; opacity: 0.3; margin-bottom: 0.2rem; }

  .item-name {
    display: block;
    font-size: 0.8125rem;
    font-variation-settings: 'wght' 300;
    color: var(--color-ink);
    margin-bottom: 0.25rem;
  }

  .item-size  { display: block; opacity: 0.4; text-transform: none; letter-spacing: 0.04em; }
  .item-price { opacity: 0.5; }

  .remove-btn {
    background: none;
    border: none;
    color: var(--color-ink);
    opacity: 0.25;
    font-size: 1rem;
    line-height: 1;
    padding: 0;
    flex-shrink: 0;
    transition: opacity 0.2s;
  }
  .remove-btn:hover { opacity: 1; }

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
  }

  .total-amount {
    font-family: var(--font-serif);
    font-size: 1.5rem;
    font-style: italic;
    font-variation-settings: 'wght' 400;
    color: var(--color-ink);
  }

  .checkout-btn {
    width: 100%;
    background: var(--color-ink);
    color: var(--color-white);
    border: none;
    padding: 1rem;
    letter-spacing: 0.18em;
    transition: background 0.2s;
  }
  .checkout-btn:hover { background: var(--color-ink-soft); }
</style>
