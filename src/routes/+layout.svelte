<script lang="ts">
  import "../app.css";
  import { onMount } from "svelte";
  import { afterNavigate } from "$app/navigation";
  import { page } from "$app/state";
  import Cart from "#lib/components/Cart.svelte";
  import Nav from "#lib/components/Nav.svelte";
  import { SITE } from "#lib/data/site.js";
  import { cart } from "#lib/stores/cart.svelte.js";
  import { observeAnimations } from "#lib/utils/scroll-observer.js";

  let { children } = $props();

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
  <link rel="canonical" href={page.url.pathname === "/" ? SITE.url : `${SITE.url}${page.url.pathname}`} />
</svelte:head>

<a href="#main" class="skip-link label">Skip to content</a>

<Nav />
<Cart />

<main id="main">
  {@render children()}
</main>

<footer class="footer">
  <div class="wrap">
    <div class="rule"></div>
    <div class="footer-inner">
      <div class="footer-brand">
        <span class="label muted">© {new Date().getFullYear()} {SITE.name}</span>
        <span class="label muted">{SITE.ateliers.map((atelier) => atelier.city).join(" · ")}</span>
      </div>
      <nav class="footer-nav" aria-label="Legal navigation">
        <a href="/stockists" class="label muted muted-link">Stockists</a>
        <a href="/privacy" class="label muted muted-link">Privacy</a>
        <a href="/terms" class="label muted muted-link">Terms</a>
        <a href="/contact" class="label muted muted-link">Contact</a>
      </nav>
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
    padding-block: var(--spacing-2xl) var(--spacing-3xl);
  }
  .footer-inner {
    display: flex; justify-content: space-between; align-items: flex-start;
    flex-wrap: wrap; gap: var(--spacing-lg);
    padding-top: var(--spacing-lg);
  }
  .footer-brand {
    display: flex; flex-direction: column; gap: var(--spacing-xs);
  }
  .footer-nav {
    display: flex; gap: var(--spacing-lg); align-items: center; flex-wrap: wrap;
  }
</style>
