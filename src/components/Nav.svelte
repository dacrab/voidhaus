<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  // Astro passes current URL via a prop on client:load — we read window.location
  let currentPath = $state('');
  let open        = $state(false);
  let cartCount   = $state(0);

  const links = [
    { href: '/collection', label: 'Collection' },
    { href: '/lookbook',   label: 'Lookbook'   },
    { href: '/about',      label: 'Manifesto'  },
    { href: '/stockists',  label: 'Stockists'  },
    { href: '/contact',    label: 'Contact'    },
  ];

  onMount(() => {
    currentPath = window.location.pathname;

    // Sync cart count from localStorage
    const syncCount = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('vh-cart') ?? '[]');
        cartCount = saved.length;
      } catch { cartCount = 0; }
    };

    syncCount();
    window.addEventListener('vh:add-to-cart', syncCount);
    window.addEventListener('vh:cart-updated', syncCount);

    return () => {
      window.removeEventListener('vh:add-to-cart', syncCount);
      window.removeEventListener('vh:cart-updated', syncCount);
    };
  });

  const isActive = (href: string) =>
    href === '/'
      ? currentPath === '/'
      : currentPath.startsWith(href);

  function openCart() {
    window.dispatchEvent(new Event('vh:open-cart'));
  }

  function toggleMenu() {
    open = !open;
    // Lock body scroll when menu is open
    document.body.style.overflow = open ? 'hidden' : '';
  }

  function closeMenu() {
    open = false;
    document.body.style.overflow = '';
  }

  // Custom clip-path transition for menu panel
  function menuTransition(node: Element, { duration = 500 } = {}) {
    return {
      duration,
      easing: cubicOut,
      css: (t: number) => {
        // t: 0 = hidden, 1 = visible
        const pct = (1 - t) * 100;
        return `
          clip-path: inset(0 0 ${pct}% 0);
          opacity: ${t};
        `;
      },
    };
  }
</script>

<a href="#main" class="skip-link">Skip to content</a>

<header class="nav" role="banner">
  <!-- Left: primary nav links (desktop) -->
  <nav class="nav-links" aria-label="Primary navigation">
    {#each links.slice(0, 2) as { href, label }}
      <a
        {href}
        class="nav-link label"
        class:active={isActive(href)}
        aria-current={isActive(href) ? 'page' : undefined}
      >
        {label}
      </a>
    {/each}
  </nav>

  <!-- Centre: wordmark -->
  <a href="/" class="nav-logo" aria-label="Voidhaus — home">VOIDHAUS</a>

  <!-- Right: actions -->
  <div class="nav-actions">
    <button
      class="nav-link label nav-cart-btn"
      onclick={openCart}
      aria-label={`Open selection${cartCount > 0 ? `, ${cartCount} item${cartCount > 1 ? 's' : ''}` : ''}`}
    >
      Selection{#if cartCount > 0}<span class="cart-badge" aria-hidden="true">{cartCount}</span>{/if}
    </button>
    <button
      class="nav-link label nav-menu-btn"
      onclick={toggleMenu}
      aria-expanded={open}
      aria-controls="mobile-menu"
      aria-label={open ? 'Close menu' : 'Open menu'}
    >
      {open ? 'Close' : 'Menu'}
    </button>
  </div>
</header>

<!-- Mobile menu -->
{#if open}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    id="mobile-menu"
    class="menu"
    role="dialog"
    aria-modal="true"
    aria-label="Site navigation"
    onkeydown={e => e.key === 'Escape' && closeMenu()}
    transition:menuTransition={{ duration: 480 }}
  >
    <div class="menu-head">
      <a href="/" class="nav-logo" onclick={closeMenu}>VOIDHAUS</a>
      <button
        class="label menu-close"
        onclick={closeMenu}
        aria-label="Close menu"
      >Close</button>
    </div>

    <nav class="menu-links" aria-label="Mobile navigation">
      {#each links as { href, label }, i}
        <a
          {href}
          class="menu-link serif"
          class:active={isActive(href)}
          aria-current={isActive(href) ? 'page' : undefined}
          style="--i:{i}"
          onclick={closeMenu}
        >
          {label}
        </a>
      {/each}
    </nav>

    <div class="menu-foot">
      <span class="label op-35">SS 2026</span>
      <button class="label op-35 menu-cart" onclick={() => { closeMenu(); openCart(); }}>
        Selection →
      </button>
    </div>
  </div>
{/if}

<style>
  /* ── Nav ─────────────────────────────────────────────────────────────── */
  .nav {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    padding: 1.5rem 1.5rem;
    border-bottom: 1px solid var(--color-rule);
    position: relative;
    z-index: 300;
  }
  @media (min-width: 640px)  { .nav { padding-inline: 2.5rem; } }
  @media (min-width: 1024px) { .nav { padding-inline: 4rem; padding-block: 1.875rem; } }
  @media (min-width: 1280px) { .nav { padding-inline: 6rem; } }

  /* ── Logo ────────────────────────────────────────────────────────────── */
  .nav-logo {
    font-family: var(--font-sans);
    font-size: 0.6875rem;
    font-variation-settings: 'wght' 400;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: var(--color-ink);
    justify-self: center;
    grid-column: 2;
  }

  /* ── Desktop links ───────────────────────────────────────────────────── */
  .nav-links {
    display: none;
    gap: 2rem;
    grid-column: 1;
  }
  @media (min-width: 768px) { .nav-links { display: flex; } }

  .nav-link {
    background: none;
    border: none;
    color: var(--color-ink);
    opacity: 0.4;
    transition: opacity 0.25s var(--ease-out);
    padding: 0;
    white-space: nowrap;
  }
  .nav-link:hover     { opacity: 1; }
  .nav-link.active    { opacity: 1; }

  /* Active page indicator — subtle underline */
  a.nav-link.active {
    position: relative;
  }
  a.nav-link.active::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0; right: 0;
    height: 1px;
    background: var(--color-ink);
  }

  /* ── Actions ─────────────────────────────────────────────────────────── */
  .nav-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 1.5rem;
    grid-column: 3;
  }

  .nav-cart-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .cart-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
    background: var(--color-ink);
    color: var(--color-white);
    font-size: 0.5rem;
    font-variation-settings: 'wght' 500;
    letter-spacing: 0;
    border-radius: 50% !important; /* intentional exception */
  }

  /* Hide desktop-only links on mobile */
  @media (max-width: 767px) {
    .nav-cart-btn { display: none; }
  }

  /* ── Mobile menu ─────────────────────────────────────────────────────── */
  .menu {
    position: fixed;
    inset: 0;
    z-index: 299;
    background: var(--color-white);
    display: flex;
    flex-direction: column;
    padding: 1.5rem 1.5rem 3rem;
    overflow-y: auto;
    /* Animation handled by menuTransition() — no CSS keyframes needed */
  }
  @media (min-width: 640px) { .menu { padding-inline: 2.5rem; } }

  .menu-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 3rem;
  }

  .menu-close {
    background: none; border: none;
    color: var(--color-ink); opacity: 0.4;
    transition: opacity 0.2s; padding: 0;
  }
  .menu-close:hover { opacity: 1; }

  .menu-links {
    display: flex;
    flex-direction: column;
    flex: 1;
    border-top: 1px solid var(--color-rule);
  }

  .menu-link {
    font-family: var(--font-serif);
    font-size: clamp(2.25rem, 8vw, 3.5rem);
    font-style: italic;
    font-variation-settings: 'wght' 400;
    letter-spacing: -0.02em;
    color: var(--color-ink);
    padding-block: 1rem;
    border-bottom: 1px solid var(--color-rule);
    opacity: 0;
    animation: link-in 0.45s var(--ease-out) both;
    animation-delay: calc(0.08s + var(--i) * 0.06s);
    transition: opacity 0.2s;
  }
  .menu-link:hover { opacity: 0.4 !important; }
  .menu-link.active { opacity: 1 !important; }

  @keyframes link-in {
    from { opacity: 0; transform: translateY(0.4rem); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .menu-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 2rem;
    border-top: 1px solid var(--color-rule);
    margin-top: 2rem;
  }

  .menu-cart {
    background: none; border: none;
    color: var(--color-ink);
    transition: opacity 0.2s; padding: 0;
  }
  .menu-cart:hover { opacity: 1 !important; }
</style>
