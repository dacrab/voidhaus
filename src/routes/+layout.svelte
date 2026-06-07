<script lang="ts">
  import '../app.css';
  import Nav from '$lib/components/Nav.svelte';
  import Cart from '$lib/components/Cart.svelte';
  import { observeAnimations } from '$lib/utils/scroll-observer';
  import { afterNavigate } from '$app/navigation';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { SITE } from '$lib/data/site';

  let { children } = $props();

  onMount(() => {
    dismissVeil();
  });

  afterNavigate(() => {
    if (browser) observeAnimations();
  });

  function dismissVeil() {
    if (!browser) return;
    const veil = document.getElementById('js-veil');
    if (!veil) return;
    const mark = veil.querySelector('.veil-mark') as HTMLElement | null;
    if (mark) {
      mark.style.opacity = '1';
      setTimeout(() => {
        mark.style.opacity = '0';
        mark.style.transform = 'scale(0.92)';
        setTimeout(() => {
          veil.classList.add('out');
          veil.addEventListener('transitionend', () => veil.remove(), { once: true });
        }, 400);
      }, 900);
    } else {
      requestAnimationFrame(() => requestAnimationFrame(() => veil.classList.add('out')));
      veil.addEventListener('transitionend', () => veil.remove(), { once: true });
    }
  }
</script>

<svelte:head>
  <meta name="description" content={SITE.tagline} />
  <meta name="robots" content="index, follow" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content={SITE.name} />
  <link rel="canonical" href="https://voidhaus.vercel.app/" />
</svelte:head>

<div id="js-veil" aria-hidden="true">
  <span class="veil-mark">VOIDHAUS</span>
</div>

<a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[10000] focus:bg-[var(--color-white)] focus:px-md focus:py-sm focus:text-[var(--color-ink)] focus:border focus:border-[var(--color-ink)]">Skip to content</a>

<Nav solidNav={false} />
<Cart />

<main id="main">
  {@render children()}
</main>

<footer class="footer">
  <div class="wrap">
    <div class="rule js-rule"></div>
    <div class="footer-inner">
      <div class="footer-brand">
        <span class="label muted">&copy; {new Date().getFullYear()} {SITE.name}</span>
        <span class="label muted">{SITE.ateliers.map(a => a.city).join(' · ')}</span>
      </div>
      <nav class="footer-nav" aria-label="Legal navigation">
        <a href="/stockists" class="label muted muted-link">Stockists</a>
        <a href="/privacy"   class="label muted muted-link">Privacy</a>
        <a href="/terms"    class="label muted muted-link">Terms</a>
        <a href="/contact" class="label muted muted-link">Contact</a>
      </nav>
    </div>
  </div>
</footer>

<style>
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
