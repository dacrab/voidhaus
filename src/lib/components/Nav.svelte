<script lang="ts">
  import { onMount, tick } from "svelte";
  import { page } from "$app/state";
  import { SITE_IMAGES } from "#lib/data/products.js";
  import { SITE } from "#lib/data/site.js";
  import { productImage, wideImage } from "#lib/images.js";
  import { cart } from "#lib/stores/cart.svelte.js";
  import { createModal } from "#lib/utils/modal.js";
  import { fade, MOTION, rise } from "#lib/utils/motion.js";

  const modal = createModal();

  const links = [
    { href: "/collection", label: "Index", img: SITE_IMAGES.editorial, wide: true },
    { href: "/lookbook", label: "Lookbook", img: SITE_IMAGES.hero, wide: true },
    { href: "/about", label: "Studio", img: SITE_IMAGES.atelier, wide: false },
    { href: "/stockists", label: "Stockists", img: "/img/11-secondary.jpg", wide: false },
    { href: "/contact", label: "Contact", img: "/img/10-secondary.jpg", wide: false },
  ] as const;

  const primaryLinks = links.slice(0, 3);
  const previews = new Map(links.map((link) => [link.href, link.wide ? wideImage(link.img) : productImage(link.img)]));

  let menuOpen = $state(false);
  let menuEl = $state<HTMLElement>();
  let scrolled = $state(false);
  let hidden = $state(false);
  let activePreview = $state<string>(links[0].href);

  const path = $derived(page.url.pathname);
  const activeLink = $derived(links.find((link) => link.href === activePreview) ?? links[0]);
  const activeIndex = $derived(links.findIndex((link) => link.href === activeLink.href));
  const preview = $derived(previews.get(activeLink.href) ?? previews.get(links[0].href)!);

  function isActive(href: string): boolean {
    if (href === "/collection") return path === href || path.startsWith("/product");
    return path === href || (href !== "/" && path.startsWith(href));
  }

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
      activePreview = links[0].href;
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
    <a href="/" class="nav-logo" aria-label="Voidhaus — home">VOIDHAUS</a>
    <span class="label nav-season">{SITE.season}</span>
  </div>

  <nav class="nav-c" aria-label="Primary navigation">
    {#each primaryLinks as link (link.href)}
      <a
        href={link.href}
        class="nav-link label"
        class:active={isActive(link.href)}
        aria-current={isActive(link.href) ? "page" : undefined}>{link.label}</a
      >
    {/each}
  </nav>

  <div class="nav-r">
    <button
      class="nav-link label nav-cart"
      type="button"
      onclick={openCart}
      aria-label="Open selection{cart.count > 0 ? `, ${cart.count} item${cart.count > 1 ? 's' : ''}` : ''}"
    >
      <span class="nav-cart-word">Selection</span>
      <span class="nav-count">[{cart.count}]</span>
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
    in:fade={{ duration: MOTION.base }}
    out:fade={{ duration: MOTION.panelOut }}
  >
    <div class="menu-main">
      <nav class="menu-links" aria-label="Navigation">
        {#each links as { href, label }, index (href)}
          {@const active = isActive(href)}

          <a
            href={href}
            class="menu-link"
            class:active
            class:previewing={activePreview === href}
            aria-current={active ? "page" : undefined}
            onclick={toggleMenu}
            onmouseenter={() => (activePreview = href)}
            onfocus={() => (activePreview = href)}
            in:rise={{ y: 18, duration: MOTION.panel, delay: 80 + index * MOTION.stagger }}
          >
            <span class="menu-link-num">0{index + 1}</span>
            <span class="menu-link-label">{label}</span>
            <span class="menu-link-arrow" aria-hidden="true">↗</span>
          </a>
        {/each}
      </nav>

      <div class="menu-foot">
        <div class="menu-foot-info">
          <span class="label muted">{SITE.season}</span>
          <span class="label muted">{SITE.ateliers.map((atelier) => atelier.city).join(" · ")}</span>
        </div>
        <button class="menu-foot-cart label" type="button" onclick={openCart}>
          Selection [{cart.count}] →
        </button>
      </div>
    </div>

    <div class="menu-preview" aria-hidden="true">
      {#key activePreview}
        <img
          class="menu-preview-img"
          src={preview.src}
          srcset={preview.srcset}
          sizes="(min-width: 900px) 38vw, 100vw"
          alt=""
          in:fade={{ duration: MOTION.base }}
          out:fade={{ duration: MOTION.fast }}
        />
      {/key}
      <div class="menu-preview-scrim"></div>
      <div class="menu-preview-foot">
        <span class="label ot-primary">{activeLink.label}</span>
        <span class="label ot-muted">Fig. 0{activeIndex + 1}</span>
      </div>
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
      background var(--duration-base) var(--ease-out),
      color var(--duration-base) var(--ease-out),
      transform var(--duration-base) var(--ease-out),
      box-shadow var(--duration-base) var(--ease-out);
  }

  .nav.scrolled {
    background: var(--color-surface);
    color: var(--color-ink);
    box-shadow: 0 1px 0 var(--color-rule);
  }
  .nav.hidden { transform: translateY(-100%); pointer-events: none; }
  .nav.open   { background: var(--color-surface); color: var(--color-ink); box-shadow: none; transform: none; }

  .nav-l { grid-column: 1; display: flex; align-items: baseline; gap: var(--spacing-md); min-width: 0; }
  .nav-logo {
    font-size: var(--text-sm);
    font-variation-settings: var(--fw-semibold);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: inherit;
    transition: opacity var(--duration-fast) var(--ease-out);
    white-space: nowrap;
  }
  .nav-logo:hover { opacity: var(--op-hover); }
  .nav-season { color: inherit; opacity: 0.45; }

  .nav-c { grid-column: 2; display: flex; align-items: center; gap: var(--spacing-xl); }
  .nav-link {
    color: inherit; opacity: 0.65;
    transition:
      opacity var(--duration-fast) var(--ease-out),
      color var(--duration-fast) var(--ease-out);
    background: none; border: none; padding: 0.5rem 0;
    cursor: pointer;
  }
  .nav-link:hover, .nav-link.active { opacity: 1; }
  .nav-link.active { text-decoration: underline; text-underline-offset: 5px; text-decoration-thickness: 1px; }

  .nav-r { grid-column: 3; display: flex; align-items: center; justify-content: flex-end; gap: var(--spacing-lg); }
  .nav-cart { display: flex; align-items: center; gap: 0.35rem; }
  .nav-count { font-size: 0.625rem; opacity: 0.65; }

  /* ── Menu icon (minimal line animation) ── */
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
    background: var(--color-canvas);
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 38%);
    padding-top: var(--nav-h);
    overflow: hidden;
  }

  .menu-main {
    display: grid;
    grid-template-rows: 1fr auto;
    padding: var(--spacing-xl) clamp(var(--spacing-lg), 5vw, var(--spacing-4xl)) var(--spacing-2xl);
    overflow-y: auto;
    min-width: 0;
  }

  .menu-links { display: flex; flex-direction: column; justify-content: center; }

  .menu-link {
    display: flex; align-items: baseline; gap: var(--spacing-lg);
    font-size: clamp(2.75rem, 6.4vw, 6rem);
    font-variation-settings: var(--fw-light);
    letter-spacing: var(--ls-display); line-height: 1;
    color: var(--color-soft);
    padding-block: 0.16em;
    border-bottom: 1px solid var(--color-rule);
    transition:
      color var(--duration-fast) var(--ease-out),
      padding-left var(--duration-base) var(--ease-out);
  }
  .menu-link:first-child { border-top: 1px solid var(--color-rule); }
  .menu-link:hover, .menu-link:focus-visible, .menu-link.active, .menu-link.previewing { color: var(--color-ink); }
  @media (hover: hover) {
    .menu-link:hover { padding-left: 0.35em; }
  }
  .menu-link-arrow {
    margin-left: auto;
    font-size: 0.35em;
    opacity: 0;
    transform: translate(-4px, -2px);
    transition:
      opacity var(--duration-fast) var(--ease-out),
      transform var(--duration-base) var(--ease-out);
  }
  .menu-link:hover .menu-link-arrow,
  .menu-link:focus-visible .menu-link-arrow,
  .menu-link.previewing .menu-link-arrow { opacity: 0.6; transform: translate(0, 0); }

  .menu-link-num {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    letter-spacing: var(--ls-label);
    color: var(--color-mid);
    flex-shrink: 0;
    width: 2.5rem;
  }
  .menu-link.active .menu-link-num { color: var(--color-ink-soft); }

  .menu-foot {
    display: flex; align-items: flex-end; justify-content: space-between;
    padding-top: var(--spacing-xl); gap: var(--spacing-md); flex-wrap: wrap;
  }
  .menu-foot-info { display: flex; flex-direction: column; gap: var(--spacing-xs); }
  .menu-foot-cart {
    background: none; border: none;
    color: var(--color-ink); opacity: var(--op-muted);
    transition: opacity var(--duration-fast) var(--ease-out);
    cursor: pointer;
  }
  .menu-foot-cart:hover { opacity: 1; }

  .menu-preview {
    position: relative;
    overflow: hidden;
    border-left: 1px solid var(--color-rule);
    background: var(--color-surface);
  }
  .menu-preview-img {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    filter: saturate(0.8) contrast(1.06) brightness(0.82);
  }
  .menu-preview-scrim {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgb(0 0 0 / 0.7), transparent 45%);
  }
  .menu-preview-foot {
    position: absolute; inset-inline: 0; bottom: 0;
    display: flex; justify-content: space-between;
    gap: var(--spacing-md);
    padding: var(--spacing-lg) var(--spacing-xl);
  }

  @media (max-width: 899px) {
    .nav { grid-template-columns: 1fr auto; }
    .nav-c { display: none; }
    .nav-r { grid-column: 2; gap: var(--spacing-md); }
    .nav-season { display: none; }
    .menu { grid-template-columns: 1fr; }
    .menu-preview { display: none; }
  }

  @media (max-width: 479px) {
    .nav-cart-word { display: none; }
  }
</style>
