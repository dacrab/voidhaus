<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { createModal, slideIn } from '#lib/utils/modal.js';
  import { getCart, saveCart, formatPrice, isValidCartItem, CART_KEY, type CartItem } from '#lib/utils/cart.js';
  import { CheckoutResponseSchema } from '#lib/utils/schemas.js';

  const modal = createModal();

  let open = $state(false);
  let items = $state.raw<CartItem[]>([]);
  let panelEl = $state<HTMLElement | undefined>();
  let checking = $state(false);
  let checkoutError = $state('');

  const total = $derived(
    formatPrice(items.reduce((s, i) => s + i.price, 0))
  );

  async function checkout() {
    checking = true;
    checkoutError = '';
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ slug: i.slug, size: i.size })),
        }),
      });
      const parsed = CheckoutResponseSchema.safeParse(await res.json());
      if (!parsed.success) {
        checkoutError = 'Something went wrong';
        return;
      }
      if ('url' in parsed.data) {
        // Don't clear the cart yet — if the customer cancels on Stripe they keep
        // their selection. The cart is cleared on /checkout/success after payment.
        window.location.href = parsed.data.url;
      } else {
        checkoutError = parsed.data.error;
      }
    } catch {
      checkoutError = 'Something went wrong';
    } finally {
      checking = false;
    }
  }

  function openCart() {
    open = true;
    modal.open(panelEl);
  }

  function closeCart() {
    open = false;
    modal.close();
  }

  function remove(slug: string, size: string) {
    items = items.filter(i => !(i.slug === slug && i.size === size));
    saveCart(items);
  }

  function onKeydown(e: KeyboardEvent) {
    if (open && modal.handleKeydown(panelEl, e)) closeCart();
  }

  onMount(() => {
    items = getCart();

    const onAdd = (e: Event) => {
      // window-level events are a public bus: any script on the page can dispatch
      // vh:add-to-cart, so validate the detail before it enters cart state.
      if (!(e instanceof CustomEvent) || !isValidCartItem(e.detail)) return;
      const item = e.detail;
      if (!items.find(i => i.slug === item.slug && i.size === item.size)) {
        items = [...items, item];
        saveCart(items);
      }
      openCart();
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === CART_KEY) items = getCart();
    };

    window.addEventListener('vh:open-cart', openCart);
    window.addEventListener('vh:add-to-cart', onAdd);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('vh:open-cart', openCart);
      window.removeEventListener('vh:add-to-cart', onAdd);
      window.removeEventListener('storage', onStorage);
    };
  });
</script>

<svelte:window onkeydown={onKeydown} />

{#if open}
  <div
    class="backdrop cart-backdrop"
    role="presentation"
    onclick={closeCart}
    transition:fade={{ duration: 450 }}
  ></div>

  <div
    class="panel"
    role="dialog"
    aria-modal="true"
    aria-label="Your selection"
    bind:this={panelEl}
    in:slideIn
    out:slideIn
  >
    <div class="panel-head">
      <span class="label">Selection ({items.length})</span>
      <button class="label ghost-btn" onclick={closeCart} aria-label="Close selection">Close</button>
    </div>
    <div class="rule"></div>

    {#if items.length === 0}
      <div class="empty">
        <p class="empty-msg">Your selection is empty.</p>
        <a href="/collection" class="label empty-link" onclick={closeCart}>Browse Collection →</a>
      </div>
    {:else}
      <ul class="items">
        {#each items as item (item.slug + item.size)}
          <li class="item">
            <a href="/product/{item.slug}" class="item-img-link" onclick={closeCart}>
              <div class="item-img-wrap">
                <img class="item-img" src={item.img} alt={item.name}
                  width="200" height="267" decoding="async" />
              </div>
            </a>
            <div class="item-body">
              <div class="item-top">
                <div>
                  <span class="label op-30">{item.num}</span>
                  <span class="item-name">{item.name}</span>
                  <span class="item-size label">Size {item.size}</span>
                </div>
                <button class="label ghost-btn" onclick={() => remove(item.slug, item.size)}
                  aria-label="Remove {item.name}, size {item.size}">Remove</button>
              </div>
              <span class="item-price label">€ {formatPrice(item.price)}</span>
            </div>
          </li>
          <div class="rule"></div>
        {/each}
      </ul>

      <div class="footer">
        <div class="total-row">
          <span class="label muted">Estimated total</span>
          <span class="total serif">€ {total}</span>
        </div>
        <p class="ship-note label muted">Duty-free · Worldwide shipping</p>
        <button class="checkout-btn label" onclick={checkout} disabled={checking}>
          {checking ? 'Processing…' : 'Complete Selection'}
        </button>
        {#if checkoutError}
          <p class="checkout-error label">{checkoutError}</p>
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style>
  .cart-backdrop { --backdrop-z: 400; background: var(--scrim-medium); }

  .panel {
    position: fixed; inset-block: 0; inset-inline-end: 0;
    width: min(420px, 100vw);
    background: var(--color-white);
    z-index: 401;
    display: flex; flex-direction: column;
    border-left: 1px solid var(--color-rule);
  }

  .panel-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: var(--spacing-xl) var(--spacing-lg) 1.5rem;
  }

  .empty {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: var(--spacing-xl); padding: var(--spacing-2xl) var(--spacing-lg); text-align: center;
  }
  .empty-msg  { font-size: var(--text-base); font-variation-settings: var(--fw-normal); color: var(--color-soft); }
  .empty-link { color: var(--color-ink); opacity: var(--op-muted); transition: opacity var(--duration-fast); border-bottom: 1px solid var(--color-rule); }
  .empty-link:hover { opacity: 1; }

  .items {
    flex: 1; overflow-y: auto; list-style: none;
    background:
      linear-gradient(var(--color-white) 30%, transparent),
      linear-gradient(transparent, var(--color-white) 70%) bottom,
      radial-gradient(farthest-side at 50% 0, var(--scrim-light), transparent),
      radial-gradient(farthest-side at 50% 100%, var(--scrim-light), transparent) bottom;
    background-repeat: no-repeat;
    background-size: 100% 40px, 100% 40px, 100% 10px, 100% 10px;
    background-attachment: local, local, scroll, scroll;
  }

  .item {
    display: grid; grid-template-columns: 80px 1fr;
    gap: 1.5rem; padding: 1.5rem var(--spacing-lg); align-items: start;
  }

  .item-img-wrap { aspect-ratio: 3/4; overflow: hidden; background: var(--color-off); }
  .item-img {
    width: 100%; height: 100%;
    object-fit: cover; object-position: center;
    transition: opacity var(--duration-base);
  }
  .item-img-link:hover .item-img { opacity: var(--op-hover); }

  .item-body {
    display: flex; flex-direction: column; justify-content: space-between;
    gap: var(--spacing-md); padding-block: var(--spacing-xs); min-height: 100%;
  }
  .item-top  { display: flex; justify-content: space-between; align-items: flex-start; gap: var(--spacing-sm); }
  .item-name { font-size: var(--text-sm); font-variation-settings: var(--fw-normal); color: var(--color-ink); display: block; line-height: 1.3; }

  .footer {
    padding: 1.5rem var(--spacing-lg) var(--spacing-2xl);
    display: flex; flex-direction: column; gap: var(--spacing-lg);
    border-top: 1px solid var(--color-rule);
  }

  .total-row  { display: flex; align-items: baseline; justify-content: space-between; padding-block: var(--spacing-xs); }
  .total      { font-size: var(--text-xl); font-style: italic; font-variation-settings: var(--fw-medium); color: var(--color-ink); }

  .item-size  { opacity: var(--op-muted); text-transform: none; letter-spacing: var(--ls-wide); }
  .item-price { opacity: var(--op-muted); }
  .ship-note  { text-align: center; opacity: var(--op-disabled); letter-spacing: var(--ls-wide); }

  .checkout-btn {
    width: 100%; background: var(--color-ink); color: var(--color-white);
    border: none; padding: var(--spacing-md); letter-spacing: var(--ls-button); transition: background var(--duration-base);
  }
  .checkout-btn:hover { background: var(--color-ink-soft); }
  .checkout-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .checkout-error { color: var(--color-error); text-align: center; font-size: 12px; }
</style>
