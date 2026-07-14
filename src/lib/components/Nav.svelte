<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { fade } from 'svelte/transition';
  import { createModal, panelIn } from '$lib/utils/modal';
  import { getCart } from '$lib/utils/cart';
  import { SITE } from '$lib/data/site';

  interface Props { solidNav?: boolean; }
  let { solidNav = false }: Props = $props();

  const modal = createModal();

  let path = $state('');
  let open = $state(false);
  let cartCount = $state(0);
  let scrolled = $state(false);
  let hidden = $state(false);

  const links = [
    { href: '/collection', label: 'Collection' },
    { href: '/lookbook', label: 'Lookbook' },
    { href: '/about', label: 'About' },
    { href: '/stockists', label: 'Stockists' },
    { href: '/contact', label: 'Contact' },
  ];

  afterNavigate(() => { path = window.location.pathname; });

  onMount(() => {
    path = window.location.pathname;
    scrolled = solidNav || window.scrollY > 40;

    const syncCart = () => { cartCount = getCart().length; };
    syncCart();
    window.addEventListener('vh:cart-updated', syncCart);

    let lastY = 0;
    const onScroll = () => {
      const y = window.scrollY;
      scrolled = solidNav || y > 40;
      hidden = y > lastY && y > 120 && !open;
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('vh:cart-updated', syncCart);
      window.removeEventListener('scroll', onScroll);
    };
  });

  function openCart() { window.dispatchEvent(new Event('vh:open-cart')); }
  
  function toggleMenu() {
    if (open) {
      open = false;
      modal.close();
    } else {
      open = true;
      modal.open();
      tick().then(() => {
        const menuLinks = document.querySelectorAll<HTMLElement>('.menu-link');
        menuLinks.forEach((link, i) => {
          link.style.transitionDelay = `${i * 0.09}s`;
          link.classList.add('in-view');
        });
      });
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
  <div class="nav-l">
    <a href="/collection" class="nav-link label hidden sm:block">Collection</a>
  </div>

  <a href="/" class="nav-logo" aria-label="Voidhaus — home">VOIDHAUS</a>

  <div class="nav-r">
    <button class="nav-link label nav-cart" onclick={openCart}
      aria-label="Open selection{cartCount > 0 ? `, ${cartCount} item${cartCount > 1 ? 's' : ''}` : ''}">
      Selection{#if cartCount > 0}<span class="badge" aria-hidden="true">{cartCount}</span>{/if}
    </button>
    <button class="nav-link label" onclick={toggleMenu}
      aria-expanded={open} aria-controls="nav-menu"
      aria-label={open ? 'Close menu' : 'Open menu'}>
      <span class="menu-toggle">{open ? 'Close' : 'Menu'}</span>
      <span class="menu-icon" aria-hidden="true">
        <span class="menu-bar" class:open></span>
        <span class="menu-bar" class:open></span>
      </span>
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
           onclick={handleNavClick}>
          <span class="menu-link-num">0{i + 1}</span>
          {label}
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
    padding-inline: var(--spacing-lg); height: var(--nav-h);
    color: var(--ot-primary);
    transition:
      background var(--duration-base) ease,
      color var(--duration-base) ease,
      transform var(--duration-slower) var(--ease-out),
      box-shadow var(--duration-base) ease;
  }
  @media (min-width: 640px)  { .nav { padding-inline: 2.5rem; } }
  @media (min-width: 1024px) { .nav { padding-inline: var(--spacing-3xl); } }

  .nav.scrolled {
    background: var(--color-off);
    color: var(--color-ink);
    box-shadow: 0 1px 0 var(--color-rule);
  }
  .nav.hidden { transform: translateY(-100%); pointer-events: none; }
  .nav.open   { background: var(--color-off); color: var(--color-ink); box-shadow: none; transform: none; }

  .nav-logo {
    font-size: var(--text-sm); font-variation-settings: var(--fw-semibold);
    letter-spacing: var(--ls-label); text-transform: uppercase; color: inherit;
    grid-column: 2; justify-self: center;
    transition: opacity var(--duration-fast);
  }
  .nav-logo:hover { opacity: var(--op-hover); }

  .nav-l {
    grid-column: 1;
    display: flex; align-items: center;
  }

  .nav-link {
    color: inherit; opacity: var(--op-hover);
    transition: opacity var(--duration-fast);
    background: none; border: none; padding: 0.75rem;
    display: inline-flex; align-items: center; gap: var(--spacing-sm);
  }
  .nav-link:hover { opacity: 1; }

  .nav-r {
    display: flex; align-items: center;
    justify-content: flex-end; gap: var(--spacing-lg); grid-column: 3;
  }
  .nav-cart { display: flex; align-items: center; gap: 0.4rem; }
  @media (max-width: 767px) { .nav-cart { display: none; } }

  .badge {
    display: inline-flex; align-items: center; justify-content: center;
    width: var(--spacing-md); height: var(--spacing-md);
    background: currentColor; color: var(--color-white);
    font-size: var(--text-xs); font-variation-settings: var(--fw-semibold); letter-spacing: 0;
    border-radius: var(--radius-full);
    transition: background var(--duration-fast), color var(--duration-fast);
  }
  .nav:not(.scrolled):not(.open) .badge {
    background: var(--ot-primary); color: var(--color-ink);
  }

  /* ── Menu icon (minimal line animation) ── */
  .menu-toggle { display: none; }
  @media (max-width: 767px) { .menu-toggle { display: inline; } }
  .menu-icon {
    display: inline-flex; flex-direction: column; gap: 3px;
    width: 14px;
  }
  .menu-bar {
    display: block; width: 100%; height: 1px;
    background: currentColor;
    transition: transform var(--duration-base) var(--ease-out);
    transform-origin: center;
  }
  .menu-bar.open:first-child { transform: rotate(45deg) translateY(3px); }
  .menu-bar.open:last-child  { transform: rotate(-45deg) translateY(-3px); }

  /* ── Menu panel ── */
  .menu {
    position: fixed; inset: 0; z-index: 299;
    background: var(--color-off);
    display: grid; grid-template-rows: 1fr auto;
    padding: var(--nav-h) clamp(var(--spacing-lg), 5vw, var(--spacing-4xl)) var(--spacing-2xl);
    overflow-y: auto;
  }

  .menu-links { display: flex; flex-direction: column; justify-content: center; }

  .menu-link {
    display: flex; align-items: baseline; gap: var(--spacing-lg);
    font-size: clamp(2.5rem, 7vw, 6.5rem);
    font-variation-settings: var(--fw-light);
    letter-spacing: var(--ls-display); line-height: 1.05;
    color: var(--color-ink);
    padding-block: 0.4em;
    border-bottom: 1px solid var(--color-soft);
    opacity: 0;
    transform: translateY(30px);
    transition:
      opacity 0.8s var(--ease-out),
      transform 0.8s var(--ease-out),
      color var(--duration-fast);
  }
  .menu-link:global(.in-view) {
    opacity: 1;
    transform: translateY(0);
  }
  .menu-link:first-child { border-top: 1px solid var(--color-soft); }
  .menu-link:hover  { opacity: var(--op-hover); }
  .menu-link.active { opacity: var(--op-hover); }

  .menu-link-num {
    font-size: var(--font-size-xs);
    font-variation-settings: var(--fw-medium);
    letter-spacing: var(--ls-label);
    color: var(--color-mid);
    flex-shrink: 0;
    width: 2.5rem;
  }

  .menu-foot {
    display: flex; align-items: flex-end; justify-content: space-between;
    padding-top: var(--spacing-xl); gap: var(--spacing-md); flex-wrap: wrap;
  }
  .menu-foot-info { display: flex; flex-direction: column; gap: var(--spacing-xs); }
  .menu-foot-cart {
    background: none; border: none;
    color: var(--color-ink); opacity: var(--op-muted);
    transition: opacity var(--duration-fast);
  }
  .menu-foot-cart:hover { opacity: 1; }
</style>
