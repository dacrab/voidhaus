<script lang="ts">
  import { onMount } from 'svelte';
  import { lockScroll, unlockScroll } from '../lib/scrollLock';
  import { cubicOut } from 'svelte/easing';

  interface Props { solidNav?: boolean; }
  let { solidNav = false }: Props = $props();

  let currentPath = $state('');
  let open        = $state(false);
  let cartCount   = $state(0);
  let scrolled    = $state(solidNav);
  let hidden      = $state(false);

  const links = [
    { href: '/collection', label: 'Collection' },
    { href: '/lookbook',   label: 'Lookbook'   },
    { href: '/about',      label: 'Manifesto'  },
    { href: '/stockists',  label: 'Stockists'  },
    { href: '/contact',    label: 'Contact'    },
  ];

  onMount(() => {
    currentPath = window.location.pathname;

    const syncCount = () => {
      try { cartCount = JSON.parse(localStorage.getItem('vh-cart') ?? '[]').length; }
      catch { cartCount = 0; }
    };
    syncCount();
    window.addEventListener('vh:add-to-cart', syncCount);
    window.addEventListener('vh:cart-updated', syncCount);

    let lastY = 0;
    const onScroll = () => {
      const y  = window.scrollY;
      scrolled = solidNav || y > 40;
      hidden   = y > lastY && y > 120 && !open;
      lastY    = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('vh:add-to-cart', syncCount);
      window.removeEventListener('vh:cart-updated', syncCount);
      window.removeEventListener('scroll', onScroll);
    };
  });

  const isActive = (href: string) =>
    href === '/' ? currentPath === '/' : currentPath.startsWith(href);

  function openCart()   { window.dispatchEvent(new Event('vh:open-cart')); }
  function toggleMenu() { open ? closeMenu() : (open = true, lockScroll()); }
  function closeMenu()  { open = false; unlockScroll(); }

  function menuTransition(node: Element, { duration = 420 } = {}) {
    return {
      duration, easing: cubicOut,
      // Use transform (GPU-composited) instead of clip-path (CPU-rasterised)
      css: (t: number) => `
        opacity: ${t};
        transform: translateY(${(1 - t) * -1.5}rem);
        will-change: opacity, transform;
      `,
    };
  }
</script>

<a href="#main" class="skip-link">Skip to content</a>

<header class="nav" class:scrolled class:hidden class:menu-open={open} role="banner">
  <nav class="nav-links" aria-label="Primary navigation">
    {#each links.slice(0, 2) as { href, label }}
      <a {href} class="nav-link label" class:active={isActive(href)}
         aria-current={isActive(href) ? 'page' : undefined}>{label}</a>
    {/each}
  </nav>

  <a href="/" class="nav-logo" aria-label="Voidhaus — home">VOIDHAUS</a>

  <div class="nav-actions">
    <button class="nav-link label nav-cart-btn" onclick={openCart}
      aria-label={`Open selection${cartCount > 0 ? `, ${cartCount} item${cartCount > 1 ? 's' : ''}` : ''}`}>
      Selection{#if cartCount > 0}<span class="cart-badge" aria-hidden="true">{cartCount}</span>{/if}
    </button>
    <button class="nav-link label" onclick={toggleMenu}
      aria-expanded={open} aria-controls="mobile-menu"
      aria-label={open ? 'Close menu' : 'Open menu'}>
      {open ? 'Close' : 'Menu'}
    </button>
  </div>
</header>

{#if open}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div id="mobile-menu" class="menu" role="dialog" aria-modal="true"
    aria-label="Site navigation" onkeydown={e => e.key === 'Escape' && closeMenu()}
    transition:menuTransition>
    <div class="menu-head">
      <a href="/" class="nav-logo" onclick={closeMenu}>VOIDHAUS</a>
      <button class="label ghost-btn" onclick={closeMenu} aria-label="Close menu">Close</button>
    </div>
    <nav class="menu-links" aria-label="Mobile navigation">
      {#each links as { href, label }, i}
        <a {href} class="menu-link serif" class:active={isActive(href)}
           aria-current={isActive(href) ? 'page' : undefined}
           style="--i:{i}" onclick={closeMenu}>{label}</a>
      {/each}
    </nav>
    <div class="menu-foot">
      <span class="label op-35">SS 2026</span>
      <button class="label ghost-btn" onclick={() => { closeMenu(); openCart(); }}>Selection →</button>
    </div>
  </div>
{/if}

<style>
  /* ── Nav bar ─────────────────────────────────────────────────────────── */
  .nav {
    position: fixed;
    inset-block-start: 0;
    inset-inline: 0;
    z-index: 300;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    padding-inline: 1.5rem;
    height: var(--nav-h);
    background: transparent;
    color: rgb(255 255 255 / 0.85);
    transition: background 0.35s ease, color 0.35s ease,
                transform 0.3s ease, box-shadow 0.35s ease;
  }
  @media (min-width: 640px)  { .nav { padding-inline: 2.5rem; } }
  @media (min-width: 1024px) { .nav { padding-inline: 4rem;   } }

  /* Solid when scrolled */
  .nav.scrolled {
    background: rgb(250 249 247 / 0.96);
    color: var(--color-ink);
    box-shadow: 0 1px 0 var(--color-rule);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  /* Slide up when scrolling down */
  .nav.hidden { transform: translateY(-100%); pointer-events: none; }

  /* Always solid when menu open */
  .nav.menu-open {
    background: var(--color-white);
    color: var(--color-ink);
    box-shadow: none;
    transform: none;
  }

  /* ── Logo ────────────────────────────────────────────────────────────── */
  .nav-logo {
    font-size: 0.8125rem;
    font-variation-settings: 'wght' 500;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: inherit;
    grid-column: 2;
    justify-self: center;
  }

  /* ── Links ───────────────────────────────────────────────────────────── */
  .nav-links { display: none; gap: 2rem; grid-column: 1; }
  @media (min-width: 768px) { .nav-links { display: flex; } }

  .nav-link {
    color: inherit; opacity: 0.6;
    transition: opacity 0.2s;
    background: none; border: none; padding: 0;
  }
  .nav-link:hover, .nav-link.active { opacity: 1; }
  .nav-link.active { position: relative; }
  .nav-link.active::after {
    content: '';
    position: absolute;
    inset-block-end: -3px;
    inset-inline: 0;
    height: 1px;
    background: currentColor;
  }

  /* ── Actions ─────────────────────────────────────────────────────────── */
  .nav-actions {
    display: flex; align-items: center;
    justify-content: flex-end; gap: 1.5rem; grid-column: 3;
  }
  .nav-cart-btn { display: flex; align-items: center; gap: 0.4rem; }
  @media (max-width: 767px) { .nav-cart-btn { display: none; } }

  .cart-badge {
    display: inline-flex; align-items: center; justify-content: center;
    width: 1rem; height: 1rem;
    background: currentColor; color: var(--color-white);
    font-size: 0.5rem; font-variation-settings: 'wght' 500; letter-spacing: 0;
    border-radius: 50% !important;
  }
  /* Invert badge when nav is transparent over hero */
  .nav:not(.scrolled):not(.menu-open) .cart-badge {
    background: rgb(255 255 255 / 0.85);
    color: var(--color-ink);
  }

  /* ── Mobile menu ─────────────────────────────────────────────────────── */
  .menu {
    position: fixed; inset: 0; z-index: 299;
    background: var(--color-white);
    display: flex; flex-direction: column;
    padding: 0 1.5rem 3rem;
    overflow-y: auto;
  }
  @media (min-width: 640px) { .menu { padding-inline: 2.5rem; } }

  .menu-head {
    display: flex; align-items: center; justify-content: space-between;
    height: var(--nav-h); flex-shrink: 0;
  }

  .menu-links {
    display: flex; flex-direction: column; flex: 1;
    border-top: 1px solid var(--color-rule);
  }

  .menu-link {
    font-family: var(--font-serif);
    font-size: clamp(2.25rem, 8vw, 3.5rem);
    font-style: italic; font-variation-settings: 'wght' 400;
    letter-spacing: -0.02em; color: var(--color-ink);
    padding-block: 1rem; border-bottom: 1px solid var(--color-rule);
    opacity: 0;
    /* GPU-composited properties only — no layout-triggering properties */
    animation: link-in 0.5s var(--ease-out) both;
    animation-delay: calc(0.06s + var(--i) * 0.055s);
    transition: opacity 0.25s ease;
  }
  .menu-link:hover  { opacity: 0.4 !important; }
  .menu-link.active { opacity: 1   !important; }

  @keyframes link-in {
    from { opacity: 0; transform: translateY(0.5rem); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .menu-foot {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 2rem; border-top: 1px solid var(--color-rule); margin-top: 2rem;
  }
</style>
