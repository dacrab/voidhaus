<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { createModal, panelIn } from '@lib/modal';
  import { getCart } from '@lib/cart';
  import { SITE } from '@data/site';

  interface Props { solidNav?: boolean; }
  let { solidNav = false }: Props = $props();

  const modal = createModal();

  let path = $state('');
  let open = $state(false);
  let cartCount = $state(0);
  let scrolled = $state(false);
  let hidden = $state(false);

  const links = [
    { href: '/collection', label: 'Curated Collection' },
    { href: '/lookbook', label: 'Lookbook' },
    { href: '/about', label: 'Manifesto' },
    { href: '/stockists', label: 'Stockists' },
    { href: '/contact', label: 'Contact' },
  ];

  onMount(() => {
    path = window.location.pathname;
    document.addEventListener('astro:page-load', () => {
      path = window.location.pathname;
    });

    const syncCart = () => { cartCount = getCart().length; };
    syncCart();
    window.addEventListener('vh:cart-updated', syncCart);

    let lastY = 0;
    scrolled = solidNav;
    const onScroll = () => {
      const y = window.scrollY;
      scrolled = solidNav || y > 40;
      hidden = y > lastY && y > 120 && !open;
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  });

  function openCart() { window.dispatchEvent(new Event('vh:open-cart')); }
  
  function toggleMenu() {
    if (open) {
      open = false;
      modal.close();
    } else {
      open = true;
      modal.open();
    }
  }

  function handleNavClick() {
    open = false;
    modal.close();
  }

  function onKeydown(e: KeyboardEvent) {
    if (open && e.key === 'Escape') toggleMenu();
  }
</script>

<svelte:window onkeydown={onKeydown} />

<header class="nav" class:scrolled class:hidden class:open>
  <div class="nav-l"></div>

  <a href="/" class="nav-logo" aria-label="Voidhaus — home">VOIDHAUS</a>

  <div class="nav-r">
    <button class="nav-link label nav-cart" onclick={openCart}
      aria-label="Open selection{cartCount > 0 ? `, ${cartCount} item${cartCount > 1 ? 's' : ''}` : ''}">
      Selection{#if cartCount > 0}<span class="badge" aria-hidden="true">{cartCount}</span>{/if}
    </button>
    <button class="nav-link label" onclick={toggleMenu}
      aria-expanded={open} aria-controls="nav-menu"
      aria-label={open ? 'Close menu' : 'Open menu'}>
      {open ? 'Close' : 'Menu'}
    </button>
  </div>
</header>

{#if open}
  <div
    id="nav-menu"
    class="menu"
    role="dialog"
    aria-modal="true"
    aria-label="Navigation menu"
    tabindex="-1"
    in:panelIn={{ y: 0 }}
    out:fade={{ duration: 250 }}
  >
    <nav class="menu-links" aria-label="Navigation">
      {#each links as { href, label }, i}
        {@const active = href === '/' ? path === '/' : path.startsWith(href)}
        <a {href} class="menu-link" class:active
           aria-current={active ? 'page' : undefined}
           style="--i:{i}"
           onclick={handleNavClick}>
          <span class="menu-link-num label op-30">0{i + 1}</span>
          <span class="menu-link-label">{label}</span>
        </a>
      {/each}
    </nav>

    <div class="menu-foot">
      <div class="menu-foot-info">
        <span class="label op-35">{SITE.season}</span>
        <span class="label op-35">{SITE.ateliers.map(a => a.city).join(' · ')}</span>
      </div>
      <button class="menu-foot-cart label" onclick={() => { toggleMenu(); openCart(); }}>
        Selection{#if cartCount > 0} ({cartCount}){/if} →
      </button>
    </div>
  </div>
{/if}

<style>
  .nav {
    position: fixed; inset-block-start: 0; inset-inline: 0; z-index: 300;
    display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
    padding-inline: var(--space-lg); height: var(--nav-h);
    color: var(--ot-primary);
    transition: background var(--duration-base) ease, color var(--duration-base) ease,
                transform var(--duration-base) ease, box-shadow var(--duration-base) ease;
  }
  @media (min-width: 640px)  { .nav { padding-inline: 2.5rem; } }
  @media (min-width: 1024px) { .nav { padding-inline: var(--space-3xl); } }

  .nav.scrolled {
    background: rgb(248 246 242 / 0.92);
    color: var(--color-ink);
    box-shadow: 0 1px 0 var(--color-rule);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
  .nav.hidden { transform: translateY(-100%); pointer-events: none; }
  .nav.open   { background: var(--color-white); color: var(--color-ink); box-shadow: none; transform: none; }

  .nav-logo {
    font-size: var(--text-sm); font-variation-settings: var(--fw-semibold);
    letter-spacing: var(--ls-label); text-transform: uppercase; color: inherit;
    grid-column: 2; justify-self: center;
  }

  .nav-l { grid-column: 1; }

  .nav-link {
    color: inherit; opacity: var(--op-hover);
    transition: opacity var(--duration-fast);
    background: none; border: none; padding: 0;
  }
  .nav-link:hover { opacity: 1; }

  .nav-r {
    display: flex; align-items: center;
    justify-content: flex-end; gap: var(--space-lg); grid-column: 3;
  }
  .nav-cart { display: flex; align-items: center; gap: 0.4rem; }
  @media (max-width: 767px) { .nav-cart { display: none; } }

  .badge {
    display: inline-flex; align-items: center; justify-content: center;
    width: var(--space-md); height: var(--space-md);
    background: currentColor; color: var(--color-white);
    font-size: var(--text-xs); font-variation-settings: var(--fw-semibold); letter-spacing: 0;
    border-radius: var(--radius-full);
  }
  .nav:not(.scrolled):not(.open) .badge {
    background: var(--ot-primary); color: var(--color-ink);
  }

  .menu {
    position: fixed; inset: 0; z-index: 299;
    background: var(--color-off);
    display: grid; grid-template-rows: 1fr auto;
    padding: var(--nav-h) clamp(var(--space-lg), 5vw, var(--space-4xl)) var(--space-2xl);
    overflow-y: auto;
  }

  .menu-links { display: flex; flex-direction: column; justify-content: center; }

  .menu-link {
    display: flex; align-items: baseline; gap: var(--space-lg);
    font-size: clamp(2.5rem, 7vw, 6.5rem);
    font-variation-settings: var(--fw-light);
    letter-spacing: -0.04em; line-height: 1.05;
    color: var(--color-ink);
    padding-block: 0.4em;
    border-bottom: 1px solid var(--color-rule);
    opacity: 0;
    animation: link-in 0.55s var(--ease-out) both;
    animation-delay: calc(0.05s * var(--i, 0));
    transition: opacity var(--duration-fast);
  }
  .menu-link:first-child { border-top: 1px solid var(--color-rule); }
  .menu-link:hover  { opacity: var(--op-hover); }
  .menu-link.active { font-style: italic; }
  .menu-link.active .menu-link-label::after { content: ' ·'; font-style: normal; opacity: 0.3; }

  .menu-link-num   { font-size: var(--text-xs); flex-shrink: 0; width: 2rem; }
  .menu-link-label { flex: 1; }

  @keyframes link-in {
    from { opacity: 0; transform: translateY(1rem); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .menu-foot {
    display: flex; align-items: flex-end; justify-content: space-between;
    padding-top: var(--space-xl); gap: var(--space-md); flex-wrap: wrap;
  }
  .menu-foot-info { display: flex; flex-direction: column; gap: var(--space-xs); }
  .menu-foot-cart {
    background: none; border: none;
    color: var(--color-ink); opacity: var(--op-muted);
    transition: opacity var(--duration-fast);
  }
  .menu-foot-cart:hover { opacity: 1; }
</style>
