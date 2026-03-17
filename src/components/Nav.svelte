<script lang="ts">
  let open = $state(false);

  const links = [
    { href: '/collection', label: 'Collection' },
    { href: '/lookbook',   label: 'Lookbook'   },
    { href: '/about',      label: 'Manifesto'  },
    { href: '/contact',    label: 'Contact'     },
  ];

  function close() { open = false; }
</script>

<!-- Non-sticky header — luxury brands do not use sticky navs -->
<header class="nav">
  <a href="/" class="nav-logo" aria-label="Voidhaus">VOIDHAUS</a>

  <nav class="nav-links" aria-label="Primary">
    {#each links as { href, label }}
      <a {href} class="nav-link label">{label}</a>
    {/each}
  </nav>

  <div class="nav-actions">
    <button
      class="nav-link label"
      onclick={() => window.dispatchEvent(new Event('vh:open-cart'))}
    >
      Selection
    </button>
    <button
      class="nav-link label nav-menu-btn"
      onclick={() => open = !open}
      aria-expanded={open}
      aria-label={open ? 'Close menu' : 'Menu'}
    >
      {open ? 'Close' : 'Menu'}
    </button>
  </div>
</header>

<!-- Mobile overlay -->
{#if open}
  <div
    class="menu"
    role="dialog"
    aria-modal="true"
    aria-label="Navigation"
  >
    <div class="menu-head">
      <a href="/" class="nav-logo" onclick={close}>VOIDHAUS</a>
      <button class="label menu-close" onclick={close} aria-label="Close">Close</button>
    </div>
    <nav class="menu-links">
      {#each links as { href, label }, i}
        <a {href} class="menu-link serif" style="--i:{i}" onclick={close}>{label}</a>
      {/each}
    </nav>
    <div class="menu-foot">
      <span class="label" style="opacity:.35">SS 2026</span>
      <button
        class="label menu-cart"
        onclick={() => { close(); window.dispatchEvent(new Event('vh:open-cart')); }}
      >
        Selection →
      </button>
    </div>
  </div>
{/if}

<style>
  /* ── Header — never sticky, breathes at top of page ─────────────────── */
  .nav {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    padding: 2.25rem 2.5rem;
    border-bottom: 1px solid var(--color-rule);
  }

  @media (min-width: 1024px) { .nav { padding: 2.25rem 4rem; } }
  @media (min-width: 1280px) { .nav { padding: 2.25rem 6rem; } }

  .nav-logo {
    font-family: var(--font-sans);
    font-size: 0.6875rem;
    font-variation-settings: 'wght' 400;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: var(--color-ink);
    grid-column: 2;
    white-space: nowrap;
  }

  /* Links — left side desktop */
  .nav-links {
    display: none;
    gap: 2rem;
    grid-column: 1;
  }
  @media (min-width: 768px) { .nav-links { display: flex; } }

  /* Actions — right side */
  .nav-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 2rem;
    grid-column: 3;
  }

  .nav-link {
    background: none;
    border: none;
    color: var(--color-ink);
    opacity: 0.4;
    transition: opacity 0.2s;
    padding: 0;
    white-space: nowrap;
  }
  .nav-link:hover { opacity: 1; }

  /* Hide desktop links on mobile */
  @media (max-width: 767px) {
    .nav-links + .nav-actions .nav-link:not(.nav-menu-btn) { display: none; }
  }

  /* ── Mobile menu ─────────────────────────────────────────────────────── */
  .menu {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: var(--color-white);
    display: flex;
    flex-direction: column;
    padding: 2.25rem 2.5rem;
    border-top: 1px solid var(--color-rule);
    animation: menu-open 0.55s var(--ease-out) both;
    overflow-y: auto;
  }

  @keyframes menu-open {
    from { opacity: 0; transform: translateY(-1rem); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .menu-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 3rem;
  }

  .menu-close {
    background: none;
    border: none;
    color: var(--color-ink);
    opacity: 0.4;
    transition: opacity 0.2s;
    padding: 0;
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
    animation: link-fade 0.5s var(--ease-out) both;
    animation-delay: calc(0.1s + var(--i) * 0.07s);
  }
  .menu-link:hover { opacity: 0.45 !important; }

  @keyframes link-fade {
    from { opacity: 0; transform: translateY(0.5rem); }
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
    background: none;
    border: none;
    color: var(--color-ink);
    opacity: 0.4;
    transition: opacity 0.2s;
    padding: 0;
  }
  .menu-cart:hover { opacity: 1; }
</style>
