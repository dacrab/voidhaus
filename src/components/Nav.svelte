<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { lockScroll, unlockScroll } from '../lib/scrollLock';
  import { trapFocus } from '../lib/focusTrap';

  interface Props { solidNav?: boolean; }
  let { solidNav = false }: Props = $props();

  let path      = $state('');
  let open      = $state(false);
  let cartCount = $state(0);
  let scrolled  = $state(solidNav);
  let hidden    = $state(false);

  const links = [
    { href: '/collection', label: 'Collection' },
    { href: '/lookbook',   label: 'Lookbook'   },
    { href: '/about',      label: 'Manifesto'  },
    { href: '/stockists',  label: 'Stockists'  },
    { href: '/contact',    label: 'Contact'    },
  ];

  onMount(() => {
    path = window.location.pathname;
    const onPageLoad = () => { path = window.location.pathname; };
    document.addEventListener('astro:page-load', onPageLoad);

    const syncCart = () => {
      try { cartCount = JSON.parse(localStorage.getItem('vh-cart') ?? '[]').length; }
      catch { cartCount = 0; }
    };
    syncCart();
    window.addEventListener('vh:cart-updated', syncCart);

    let lastY = 0;
    const onScroll = () => {
      const y = window.scrollY;
      scrolled = solidNav || y > 40;
      hidden   = y > lastY && y > 120 && !open;
      lastY    = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      document.removeEventListener('astro:page-load', onPageLoad);
      window.removeEventListener('vh:cart-updated', syncCart);
      window.removeEventListener('scroll', onScroll);
    };
  });

  const isActive = (href: string) =>
    href === '/' ? path === '/' : path.startsWith(href);

  function openCart()   { window.dispatchEvent(new Event('vh:open-cart')); }
  function toggleMenu() {
    if (open) { close(); } else { open = true; lockScroll(); }
  }
  function close()      { open = false; unlockScroll(); }

  function menuIn(node: Element) {
    return {
      duration: 420, easing: cubicOut,
      css: (t: number) => `opacity:${t}; transform:translateY(${(1 - t) * -1.5}rem)`,
    };
  }
</script>

<a href="#main" class="skip-link">Skip to content</a>

<header class="nav" class:scrolled class:hidden class:open role="banner">
  <nav class="nav-l" aria-label="Primary navigation">
    {#each links.slice(0, 2) as { href, label }}
      <a {href} class="nav-link label" class:active={isActive(href)}
         aria-current={isActive(href) ? 'page' : undefined}>{label}</a>
    {/each}
  </nav>

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
    onkeydown={e => {
      if (e.key === 'Escape') { close(); return; }
      const menu = document.getElementById('nav-menu');
      if (menu) trapFocus(menu, e);
    }}
    in:menuIn
    out:fade={{ duration: 200 }}
  >
    <div class="menu-head">
      <a href="/" class="nav-logo" onclick={close}>VOIDHAUS</a>
      <button class="label ghost-btn" onclick={close} aria-label="Close menu">Close</button>
    </div>

    <nav class="menu-links" aria-label="Mobile navigation">
      {#each links as { href, label }, i}
        <a {href} class="menu-link serif" class:active={isActive(href)}
           aria-current={isActive(href) ? 'page' : undefined}
           style="--i:{i}" onclick={close}>{label}</a>
      {/each}
    </nav>

    <div class="menu-foot">
      <span class="label op-35">SS 2026</span>
      <button class="label ghost-btn" onclick={() => { close(); openCart(); }}>Selection →</button>
    </div>
  </div>
{/if}

<style>
  .nav {
    position: fixed; inset-block-start: 0; inset-inline: 0; z-index: 300;
    display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
    padding-inline: 1.5rem; height: var(--nav-h);
    color: rgb(255 255 255 / 0.85);
    transition: background 0.35s ease, color 0.35s ease,
                transform 0.3s ease, box-shadow 0.35s ease,
                top 0.25s ease;
  }
  @media (min-width: 640px)  { .nav { padding-inline: 2.5rem; } }
  @media (min-width: 1024px) { .nav { padding-inline: 4rem; } }

  .nav.scrolled {
    background: rgb(250 249 247 / 0.96);
    color: var(--color-ink);
    box-shadow: 0 1px 0 var(--color-rule);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
  .nav.hidden { transform: translateY(-100%); pointer-events: none; }
  .nav.open   { background: var(--color-white); color: var(--color-ink); box-shadow: none; transform: none; }

  .nav-logo {
    font-size: 0.8125rem; font-variation-settings: 'wght' 500;
    letter-spacing: 0.22em; text-transform: uppercase; color: inherit;
    grid-column: 2; justify-self: center;
  }

  .nav-l { display: none; gap: 2rem; grid-column: 1; }
  @media (min-width: 768px) { .nav-l { display: flex; } }

  .nav-link {
    color: inherit; opacity: 0.6;
    transition: opacity 0.2s;
    background: none; border: none; padding: 0;
    /* Entrance — runs once on mount, CSS owns this entirely */
    animation: nav-link-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  /* Stagger via nth-child — no JS needed */
  .nav-l .nav-link:nth-child(1) { animation-delay: 0.55s; }
  .nav-l .nav-link:nth-child(2) { animation-delay: 0.62s; }
  .nav-r .nav-link:nth-child(1) { animation-delay: 0.69s; }
  .nav-r .nav-link:nth-child(2) { animation-delay: 0.76s; }

  @keyframes nav-link-in {
    from { opacity: 0; transform: translateY(-5px); }
    to   { opacity: 0.6; transform: translateY(0); }
  }
  /* Active/hover override — must win over animation fill */
  .nav-link:hover, .nav-link.active { opacity: 1; }
  .nav-link.active { position: relative; }
  .nav-link.active::after {
    content: ''; position: absolute;
    inset-block-end: -3px; inset-inline: 0;
    height: 1px; background: currentColor;
  }

  .nav-r {
    display: flex; align-items: center;
    justify-content: flex-end; gap: 1.5rem; grid-column: 3;
  }
  .nav-cart { display: flex; align-items: center; gap: 0.4rem; }
  @media (max-width: 767px) { .nav-cart { display: none; } }

  .badge {
    display: inline-flex; align-items: center; justify-content: center;
    width: 1rem; height: 1rem;
    background: currentColor; color: var(--color-white);
    font-size: 0.5rem; font-variation-settings: 'wght' 500; letter-spacing: 0;
    border-radius: 50%;
  }
  .nav:not(.scrolled):not(.open) .badge {
    background: rgb(255 255 255 / 0.85); color: var(--color-ink);
  }

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
  .menu-head .nav-logo { grid-column: unset; justify-self: unset; }

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
    animation: link-in 0.5s var(--ease-out) both;
    animation-delay: calc(0.06s + var(--i) * 0.055s);
    transition: opacity 0.2s;
  }
  .menu-link:hover  { opacity: 0.4; }
  .menu-link.active { opacity: 1; }

  @keyframes link-in {
    from { opacity: 0; transform: translateY(0.5rem); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .menu-foot {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 2rem; border-top: 1px solid var(--color-rule); margin-top: 2rem;
  }
</style>
