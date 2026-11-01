<script lang="ts">
  import { fade } from "svelte/transition";
  import { getProduct } from "#lib/data/products.js";
  import { formatPrice } from "#lib/format.js";
  import { productImage } from "#lib/images.js";
  import { cart } from "#lib/stores/cart.svelte.js";
  import { cartItemKey } from "#lib/utils/cart.js";
  import { createModal, slideIn } from "#lib/utils/modal.js";
  import { prefersReducedMotion } from "#lib/utils/motion.js";
  import { CheckoutResponseSchema } from "#lib/utils/schemas.js";

  const modal = createModal();

  let panelEl = $state<HTMLElement>();
  let checking = $state(false);
  let checkoutError = $state("");

  const total = $derived(formatPrice(cart.items.reduce((sum, item) => sum + item.price, 0)));

  function formatLabel(slug: string): string {
    return (getProduct(slug)?.sizes.length ?? 0) > 1 ? "Size" : "Format";
  }

  let wasOpen = false;
  $effect(() => {
    if (cart.open === wasOpen) return;
    wasOpen = cart.open;
    if (cart.open) {
      modal.open(panelEl);
    } else {
      modal.close();
    }
  });

  async function checkout() {
    checking = true;
    checkoutError = "";
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.items.map((item) => ({ slug: item.slug, size: item.size })),
        }),
      });
      const parsed = CheckoutResponseSchema.safeParse(await response.json());
      if (!parsed.success) {
        checkoutError = "Something went wrong";
        return;
      }
      if ("url" in parsed.data) {
        // Keep the cart until payment is confirmed on /checkout/success.
        window.location.href = parsed.data.url;
      } else {
        checkoutError = parsed.data.error;
      }
    } catch {
      checkoutError = "Something went wrong";
    } finally {
      checking = false;
    }
  }

  function closeCart() {
    cart.closePanel();
  }

  function onKeydown(event: KeyboardEvent) {
    if (cart.open && modal.handleKeydown(panelEl, event)) closeCart();
  }
</script>

<svelte:window onkeydown={onKeydown} />

{#if cart.open}
  <div
    class="backdrop cart-backdrop"
    role="presentation"
    onclick={closeCart}
    transition:fade={{ duration: prefersReducedMotion() ? 0 : 450 }}
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
      <span class="label">Selection ({cart.count})</span>
      <button class="label ghost-btn" type="button" onclick={closeCart} aria-label="Close selection">Close</button>
    </div>
    <div class="rule"></div>

    {#if cart.items.length === 0}
      <div class="empty">
        <p class="empty-msg">Your selection is empty.</p>
        <a href="/collection" class="label empty-link" onclick={closeCart}>Enter the index →</a>
      </div>
    {:else}
      <ul class="items">
        {#each cart.items as item (cartItemKey(item))}
          {@const image = productImage(item.img)}
          <li class="item">
            <a href="/product/{item.slug}" class="item-img-link" onclick={closeCart}>
              <div class="item-img-wrap">
                <img
                  class="item-img"
                  src={image.src}
                  srcset={image.srcset}
                  sizes="80px"
                  alt={item.name}
                  width="200"
                  height="267"
                  decoding="async"
                />
              </div>
            </a>
            <div class="item-body">
              <div class="item-top">
                <div>
                  <span class="label muted">{item.num}</span>
                  <span class="item-name">{item.name}</span>
                  <span class="item-size label">{formatLabel(item.slug)} {item.size}</span>
                </div>
                <button
                  class="label ghost-btn"
                  type="button"
                  onclick={() => cart.remove(item.slug, item.size)}
                  aria-label="Remove {item.name}, {formatLabel(item.slug).toLowerCase()} {item.size}">Remove</button
                >
              </div>
              <span class="item-price label">€ {formatPrice(item.price)}</span>
            </div>
          </li>
          <li class="rule" aria-hidden="true"></li>
        {/each}
      </ul>

      <div class="footer">
        <div class="total-row">
          <span class="label muted">Estimated total</span>
          <span class="total mono">€ {total}</span>
        </div>
        <p class="ship-note label muted">Duty-free · Worldwide shipping</p>
        <button class="checkout-btn label" type="button" onclick={checkout} disabled={checking}>
          {checking ? "Processing…" : "Complete Selection"}
        </button>
        {#if checkoutError}
          <p class="checkout-error label" role="alert">{checkoutError}</p>
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
    background: var(--color-canvas);
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
  .empty-link { color: var(--color-muted); transition: color var(--duration-fast); border-bottom: 1px solid var(--color-rule); }
  .empty-link:hover { color: var(--color-ink); }

  .items {
    flex: 1; overflow-y: auto; list-style: none;
    background:
      linear-gradient(var(--color-canvas) 30%, transparent),
      linear-gradient(transparent, var(--color-canvas) 70%) bottom,
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

  .item-img-wrap { aspect-ratio: 3 / 4; overflow: hidden; background: var(--color-surface); }
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
  .total      { font-size: var(--text-xl); font-variation-settings: var(--fw-normal); color: var(--color-ink); }

  .item-size  { color: var(--color-muted); text-transform: none; letter-spacing: var(--ls-wide); }
  .item-price { color: var(--color-muted); }
  .ship-note  { text-align: center; color: var(--color-muted); letter-spacing: var(--ls-wide); }

  .checkout-btn {
    width: 100%; background: var(--color-ink); color: var(--color-canvas);
    border: none; padding: var(--spacing-md); letter-spacing: var(--ls-button); transition: background var(--duration-base);
  }
  .checkout-btn:hover { background: var(--color-ink-soft); }
  .checkout-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .checkout-error { color: var(--color-error); text-align: center; font-size: 12px; }
</style>
