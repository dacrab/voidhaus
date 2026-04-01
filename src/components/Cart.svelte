<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { lockScroll, unlockScroll } from '../lib/scrollLock';
  import { trapFocus } from '../lib/focusTrap';

  type CartItem = {
    slug:  string;
    name:  string;
    price: string;
    size:  string;
    img:   string;
    num:   string;
  };

  const KEY = 'vh-cart';

  let open      = $state(false);
  let items     = $state<CartItem[]>([]);
  let panelEl   = $state<HTMLElement | undefined>();
  let prevFocus = $state<HTMLElement | null>(null);

  const total = $derived(
    items.reduce((s, i) => s + parseFloat(i.price.replace(',', '')), 0)
      .toLocaleString('en-US', { minimumFractionDigits: 0 })
  );

  function load()  { try { items = JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch {} }
  function save()  { localStorage.setItem(KEY, JSON.stringify(items)); }
  function sync()  { window.dispatchEvent(new Event('vh:cart-updated')); }

  function openCart() {
    prevFocus = document.activeElement as HTMLElement;
    open = true;
    lockScroll();
    // Focus first interactive element after Svelte renders the panel
    requestAnimationFrame(() => {
      panelEl?.querySelector<HTMLElement>('button,[href],[tabindex]')?.focus();
    });
  }

  function closeCart() {
    open = false;
    unlockScroll();
    prevFocus?.focus();
  }

  function remove(slug: string, size: string) {
    items = items.filter(i => !(i.slug === slug && i.size === size));
    save(); sync();
  }

  function onKeydown(e: KeyboardEvent) {
    if (!open || !panelEl) return;
    if (e.key === 'Escape') { e.preventDefault(); closeCart(); return; }
    trapFocus(panelEl, e);
  }

  onMount(() => {
    load();

    const onAdd  = (e: Event) => {
      const item = (e as CustomEvent<CartItem>).detail;
      if (!items.find(i => i.slug === item.slug && i.size === item.size)) {
        items = [...items, item];
        save(); sync();
      }
      openCart();
    };

    window.addEventListener('vh:open-cart',   openCart);
    window.addEventListener('vh:add-to-cart', onAdd);
    return () => {
      window.removeEventListener('vh:open-cart',   openCart);
      window.removeEventListener('vh:add-to-cart', onAdd);
    };
  });

  const slideIn = (_node: Element) => ({
    duration: 400, easing: cubicOut,
    css: (t: number) => `transform:translateX(${(1 - t) * 100}%)`,
  });
</script>

<svelte:window onkeydown={onKeydown} />

{#if open}
  <div
    class="backdrop cart-backdrop"
    role="presentation"
    onclick={closeCart}
    transition:fade={{ duration: 300 }}
  ></div>

  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
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
      <ul class="items" role="list">
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
              <span class="item-price label">€ {item.price}</span>
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
        <p class="ship-note label muted">Complimentary worldwide shipping · Duty-free</p>
        <button class="checkout-btn label">Complete Selection</button>
      </div>
    {/if}
  </div>
{/if}

<style>
  .cart-backdrop { --backdrop-z: 400; background: rgb(28 27 25 / 0.4); }

  .panel {
    position: fixed; inset-block: 0; inset-inline-end: 0;
    width: min(420px, 100vw);
    background: var(--color-white);
    z-index: 401;
    display: flex; flex-direction: column;
    border-left: 1px solid var(--color-rule);
    will-change: transform;
    backface-visibility: hidden;
  }

  .panel-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.5rem 1.5rem 1.25rem;
  }

  .empty {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 2rem; padding: 3rem 1.5rem; text-align: center;
  }
  .empty-msg  { font-size: 0.875rem; font-variation-settings: 'wght' 300; color: var(--color-soft); }
  .empty-link { color: var(--color-ink); opacity: 0.5; transition: opacity 0.2s; border-bottom: 1px solid var(--color-rule); }
  .empty-link:hover { opacity: 1; }

  .items {
    flex: 1; overflow-y: auto; list-style: none;
    background:
      linear-gradient(var(--color-white) 30%, transparent),
      linear-gradient(transparent, var(--color-white) 70%) bottom,
      radial-gradient(farthest-side at 50% 0, rgb(28 27 25 / 0.08), transparent),
      radial-gradient(farthest-side at 50% 100%, rgb(28 27 25 / 0.08), transparent) bottom;
    background-repeat: no-repeat;
    background-size: 100% 40px, 100% 40px, 100% 10px, 100% 10px;
    background-attachment: local, local, scroll, scroll;
  }

  .item {
    display: grid; grid-template-columns: 80px 1fr;
    gap: 1.25rem; padding: 1.25rem 1.5rem; align-items: start;
  }

  .item-img-wrap { aspect-ratio: 3/4; overflow: hidden; background: var(--color-off); }
  .item-img {
    width: 100%; height: 100%;
    object-fit: cover; object-position: center top;
    transition: opacity 0.3s;
  }
  .item-img-link:hover .item-img { opacity: 0.8; }

  .item-body {
    display: flex; flex-direction: column; justify-content: space-between;
    gap: 1rem; padding-block: 0.25rem; min-height: 100%;
  }
  .item-top  { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; }
  .item-name { font-size: 0.8125rem; font-variation-settings: 'wght' 300; color: var(--color-ink); display: block; line-height: 1.3; }

  .footer {
    padding: 1.25rem 1.5rem 2rem;
    display: flex; flex-direction: column; gap: 1rem;
    border-top: 1px solid var(--color-rule);
  }

  .total-row  { display: flex; align-items: baseline; justify-content: space-between; padding-block: 0.5rem; }
  .total      { font-size: 1.5rem; font-style: italic; font-variation-settings: 'wght' 400; color: var(--color-ink); }

  .item-size  { opacity: 0.4; text-transform: none; letter-spacing: 0.04em; }
  .item-price { opacity: 0.5; }
  .ship-note  { text-align: center; }

  .checkout-btn {
    width: 100%; background: var(--color-ink); color: var(--color-white);
    border: none; padding: 1rem; letter-spacing: 0.2em; transition: background 0.2s;
  }
  .checkout-btn:hover { background: var(--color-ink-soft); }
</style>
