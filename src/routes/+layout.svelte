<script lang="ts">
  import "../app.css";
  import { onMount } from "svelte";
  import { afterNavigate } from "$app/navigation";
  import { page } from "$app/state";
  import Cart from "#lib/components/Cart.svelte";
  import Nav from "#lib/components/Nav.svelte";
  import { SITE } from "#lib/data/site.js";
  import { SITE_URL } from "#lib/site-url.js";
  import { cart } from "#lib/stores/cart.svelte.js";
  import { observeAnimations } from "#lib/utils/scroll-observer.js";

  let { children } = $props();

  const canonical = $derived(new URL(page.url.pathname, SITE_URL).href);

  let stopAnimations: (() => void) | undefined;

  onMount(() => {
    cart.init();

    return () => stopAnimations?.();
  });

  afterNavigate(({ shallow, type }) => {
    if (shallow && type === "goto") return;

    stopAnimations?.();
    stopAnimations = observeAnimations();
  });
</script>

<svelte:head>
  <meta name="description" content={SITE.tagline} />
  <meta name="robots" content="index, follow" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content={SITE.name} />
  <link rel="canonical" href={canonical} />
</svelte:head>

<a href="#main" class="skip-link label">Skip to content</a>

<Nav />
<Cart />

<main id="main" tabindex="-1">
  {@render children()}
</main>

<footer class="footer">
  <div class="wrap">
    <div class="footer-top">
      <div class="footer-brand">
        <span class="label muted">© {new Date().getFullYear()} {SITE.name}</span>
        <span class="label muted">{SITE.season} — Index 001—012</span>
      </div>
      <nav class="footer-nav" aria-label="Legal navigation">
        <a href="/stockists" class="label muted muted-link">Stockists</a>
        <a href="/privacy" class="label muted muted-link">Privacy</a>
        <a href="/terms" class="label muted muted-link">Terms</a>
        <a href="/contact" class="label muted muted-link">Contact</a>
      </nav>
    </div>
    <div class="footer-mark" aria-hidden="true">VOIDHAUS</div>
    <div class="footer-bottom">
      <span class="label muted">{SITE.ateliers.map((atelier) => atelier.city).join(" — ")}</span>
      <span class="label muted">Twelve objects / one position</span>
    </div>
  </div>
</footer>

<style>
  .skip-link {
    position: fixed;
    top: var(--spacing-sm);
    left: var(--spacing-sm);
    z-index: 1000;
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--color-canvas);
    color: var(--color-ink);
    border: 1px solid var(--color-ink);
    transform: translateY(-200%);
  }
  .skip-link:focus {
    transform: translateY(0);
  }
  .footer {
    border-top: 1px solid var(--color-rule);
    margin-top: var(--spacing-3xl);
    padding-block: var(--spacing-2xl) var(--spacing-lg);
    overflow: hidden;
  }
  .footer-top {
    display: flex; justify-content: space-between; align-items: flex-start;
    flex-wrap: wrap; gap: var(--spacing-lg);
    padding-bottom: var(--spacing-2xl);
    border-bottom: 1px solid var(--color-rule);
  }
  .footer-brand {
    display: flex; flex-direction: column; gap: var(--spacing-xs);
  }
  .footer-nav {
    display: flex; gap: var(--spacing-lg); align-items: center; flex-wrap: wrap;
  }
  .footer-mark {
    font-size: clamp(3rem, 15.5vw, 15rem);
    font-variation-settings: var(--fw-light);
    letter-spacing: -0.075em;
    line-height: 0.78;
    text-transform: uppercase;
    color: var(--color-ink);
    margin-block: clamp(1.5rem, 4vw, 3rem) var(--spacing-lg);
    white-space: nowrap;
    opacity: 0.92;
  }
  .footer-bottom {
    display: flex;
    justify-content: space-between;
    gap: var(--spacing-md);
    padding-top: var(--spacing-sm);
    border-top: 1px solid var(--color-rule);
  }
</style>
