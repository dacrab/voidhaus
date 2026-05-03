<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { lockScroll, unlockScroll } from '../lib/scrollLock';
  import { trapFocus } from '../lib/focusTrap';

  type CartItem = {
    slug:  string;
    name:  string;
    price: string; // formatted display string e.g. "3,200"
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
    items.reduce((s, i) => s + parseFloat(i.price.replace(/,/g, '')), 0)
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
    duration: 400, easing: cubicOut, // --duration-slow
    css: (t: number) => `transform:translateX(${(1 - t) * 100}%)`,
  });

  const dur = { fade: 300 };
  $effect(() => {
    const root = getComputedStyle(document.documentElement);
    dur.fade = parseFloat(root.getPropertyValue('--duration-base')) * 1000;
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
  .cart-backdrop { --backdrop-z: 400; background: var(--scrim-dark-medium); }

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
    padding: var(--space-lg) var(--space-lg) 1.25rem;
  }

  .empty {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: var(--space-xl); padding: var(--space-2xl) var(--space-lg); text-align: center;
  }
  .empty-msg  { font-size: var(--text-base); font-variation-settings: var(--font-weight-normal); color: var(--color-soft); }
  .empty-link { color: var(--color-ink); opacity: var(--opacity-muted); transition: opacity var(--duration-fast); border-bottom: 1px solid var(--color-rule); }
  .empty-link:hover { opacity: 1; }

  .items {
    flex: 1; overflow-y: auto; list-style: none;
    background:
      linear-gradient(var(--color-white) 30%, transparent),
      linear-gradient(transparent, var(--color-white) 70%) bottom,
      radial-gradient(farthest-side at 50% 0, var(--scrim-dark-light), transparent),
      radial-gradient(farthest-side at 50% 100%, var(--scrim-dark-light), transparent) bottom;
    background-repeat: no-repeat;
    background-size: 100% 40px, 100% 40px, 100% 10px, 100% 10px;
    background-attachment: local, local, scroll, scroll;
  }

  .item {
    display: grid; grid-template-columns: 80px 1fr;
    gap: 1.25rem; padding: 1.25rem var(--space-lg); align-items: start;
  }

  .item-img-wrap { aspect-ratio: 3/4; overflow: hidden; background: var(--color-off); }
  .item-img {
    width: 100%; height: 100%;
    object-fit: cover; object-position: center top;
    transition: opacity var(--duration-base);
  }
  .item-img-link:hover .item-img { opacity: var(--opacity-hover); }

  .item-body {
    display: flex; flex-direction: column; justify-content: space-between;
    gap: var(--space-md); padding-block: var(--space-xs); min-height: 100%;
  }
  .item-top  { display: flex; justify-content: space-between; align-items: flex-start; gap: var(--space-sm); }
  .item-name { font-size: var(--text-sm); font-variation-settings: var(--font-weight-normal); color: var(--color-ink); display: block; line-height: 1.3; }

  .footer {
    padding: 1.25rem var(--space-lg) var(--space-xl);
    display: flex; flex-direction: column; gap: var(--space-md);
    border-top: 1px solid var(--color-rule);
  }

  .total-row  { display: flex; align-items: baseline; justify-content: space-between; padding-block: var(--space-xs); }
  .total      { font-size: var(--text-xl); font-style: italic; font-variation-settings: var(--font-weight-medium); color: var(--color-ink); }

  .item-size  { opacity: var(--opacity-muted); text-transform: none; letter-spacing: var(--letter-spacing-wide); }
  .item-price { opacity: var(--opacity-muted); }
  .ship-note  { text-align: center; }

  .checkout-btn {
    width: 100%; background: var(--color-ink); color: var(--color-white);
    border: none; padding: var(--space-md); letter-spacing: var(--letter-spacing-button); transition: background var(--duration-fast);
  }
  .checkout-btn:hover { background: var(--color-ink-soft); }
</style>
