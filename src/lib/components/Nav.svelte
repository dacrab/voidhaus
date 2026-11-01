<script lang="ts">
  import { onMount, tick } from "svelte";
  import { fly } from "svelte/transition";
  import { page } from "$app/state";
  import { SITE } from "#lib/data/site.js";
  import { cart } from "#lib/stores/cart.svelte.js";
  import { createModal } from "#lib/utils/modal.js";
  import { prefersReducedMotion } from "#lib/utils/motion.js";

  const modal = createModal();
  const reduced = prefersReducedMotion();

  const links = [
    { href: "/collection", label: "Collection" },
    { href: "/lookbook", label: "Lookbook" },
    { href: "/about", label: "About" },
    { href: "/stockists", label: "Stockists" },
    { href: "/contact", label: "Contact" },
  ];

  let menuOpen = $state(false);
  let menuEl = $state<HTMLElement>();
  let scrolled = $state(false);
  let hidden = $state(false);

  const path = $derived(page.url.pathname);

  onMount(() => {
    let lastY = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      scrolled = y > 40;
      hidden = !menuOpen && y > lastY && y > 120;
      lastY = y;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  });

  async function toggleMenu() {
    menuOpen = !menuOpen;
    hidden = false;
    if (menuOpen) {
      await tick();
      if (menuOpen) modal.open(menuEl);
    } else {
      modal.close();
    }
  }

  function openCart() {
    if (menuOpen) toggleMenu();
    cart.openPanel();
  }

  function onKeydown(event: KeyboardEvent) {
    if (menuOpen && modal.handleKeydown(menuEl, event)) toggleMenu();
  }
</script>

<svelte:window onkeydown={onKeydown} />

<header class="nav" class:scrolled class:hidden class:open={menuOpen}>
  <div class="nav-l">
    <a href="/collection" class="nav-link label hidden sm:block">Collection</a>
  </div>

  <a href="/" class="nav-logo" aria-label="Voidhaus — home">VOIDHAUS</a>

  <div class="nav-r">
    <button
      class="nav-link label nav-cart"
      type="button"
      onclick={openCart}
      aria-label="Open selection{cart.count > 0 ? `, ${cart.count} item${cart.count > 1 ? 's' : ''}` : ''}"
    >
      Selection{#if cart.count > 0}<span class="badge" aria-hidden="true">{cart.count}</span>{/if}
    </button>
    <button
      class="nav-link label"
      type="button"
      onclick={toggleMenu}
      aria-expanded={menuOpen}
      aria-controls="nav-menu"
      aria-label={menuOpen ? "Close menu" : "Open menu"}
    >
      <span class="menu-toggle">{menuOpen ? "Close" : "Menu"}</span>
      <span class="menu-icon" aria-hidden="true">
        <span class="menu-bar" class:open={menuOpen}></span>
        <span class="menu-bar" class:open={menuOpen}></span>
      </span>
    </button>
  </div>
</header>

{#if menuOpen}
  <div
    id="nav-menu"
    class="menu"
    role="dialog"
    aria-modal="true"
    aria-label="Navigation menu"
    bind:this={menuEl}
    in:fly={{ y: reduced ? 0 : -16, duration: reduced ? 0 : 350 }}
    out:fly={{ y: reduced ? 0 : -16, duration: reduced ? 0 : 250 }}
  >
    <nav class="menu-links" aria-label="Navigation">
      {#each links as { href, label }, index (href)}
        {@const active = path === href || (href !== "/" && path.startsWith(href))}

        <a
          href={href}
          class="menu-link"
          class:active
          aria-current={active ? "page" : undefined}
          onclick={toggleMenu}
          in:fly={{ y: reduced ? 0 : 30, duration: reduced ? 0 : 700, delay: reduced ? 0 : 100 + index * 70 }}
        >
          <span class="menu-link-num">0{index + 1}</span>
          {label}
        </a>
      {/each}
    </nav>

    <div class="menu-foot">
      <div class="menu-foot-info">
        <span class="label muted">{SITE.season}</span>
        <span class="label muted">{SITE.ateliers.map((atelier) => atelier.city).join(" · ")}</span>
      </div>
      <button class="menu-foot-cart label" type="button" onclick={openCart}>
        Selection{#if cart.count > 0} ({cart.count}){/if} →
      </button>
    </div>
  </div>
{/if}

<style>
  .nav {
    position: fixed; inset-block-start: 0; inset-inline: 0; z-index: 300;
    display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
    padding-inline: clamp(var(--spacing-lg), 5vw, var(--spacing-4xl));
    height: var(--nav-h);
    color: var(--ot-primary);
    transition:
      background var(--duration-base) ease,
      color var(--duration-base) ease,
      transform var(--duration-slower) var(--ease-out),
      box-shadow var(--duration-base) ease;
  }

  .nav.scrolled {
    background: var(--color-surface);
    color: var(--color-ink);
    box-shadow: 0 1px 0 var(--color-rule);
  }
  .nav.hidden { transform: translateY(-100%); pointer-events: none; }
  .nav.open   { background: var(--color-surface); color: var(--color-ink); box-shadow: none; transform: none; }

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
    margin-left: -0.75rem;
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
    margin-right: -0.75rem;
  }
  .nav-cart { display: flex; align-items: center; gap: 0.4rem; }
  @media (max-width: 767px) { .nav-cart { display: none; } }

  .badge {
    display: inline-flex; align-items: center; justify-content: center;
    width: var(--spacing-md); height: var(--spacing-md);
    background: currentColor; color: var(--color-canvas);
    font-size: var(--text-xs); font-variation-settings: var(--fw-semibold); letter-spacing: 0;
    border-radius: var(--radius-full);
    transition: background var(--duration-fast), color var(--duration-fast);
  }
  .nav:not(.scrolled):not(.open) .badge {
    background: var(--ot-primary); color: var(--color-canvas);
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
    background: var(--color-surface);
    display: grid; grid-template-rows: 1fr auto;
    padding: var(--nav-h) clamp(var(--spacing-lg), 5vw, var(--spacing-4xl)) var(--spacing-2xl);
    overflow-y: auto;
  }

  .menu-links { display: flex; flex-direction: column; justify-content: center; }

  .menu-link {
    display: flex; align-items: baseline; gap: var(--spacing-lg);
    font-size: clamp(2.5rem, 6vw, 5.5rem);
    font-variation-settings: var(--fw-light);
    letter-spacing: var(--ls-display); line-height: 1.05;
    color: var(--color-soft);
    padding-block: 0.22em;
    border-bottom: 1px solid var(--color-rule);
    transition: color var(--duration-fast);
  }
  .menu-link:first-child { border-top: 1px solid var(--color-rule); }
  .menu-link:hover  { color: var(--color-ink); }
  .menu-link.active { color: var(--color-ink); }
  .menu-link.active .menu-link-num { color: var(--color-ink-soft); }

  .menu-link-num {
    font-size: var(--text-xs);
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
