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
      }, 800);
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

<footer class="border-t border-[var(--color-rule)] mt-3xl">
  <div class="wrap py-6 pb-8">
    <div class="rule"></div>
    <div class="flex items-center justify-between flex-wrap gap-sm pt-lg">
      <span class="label muted">&copy; {new Date().getFullYear()} {SITE.name}</span>
      <nav class="flex gap-lg items-center" aria-label="Legal navigation">
        <a href="/stockists" class="label muted muted-link" style="padding-block:0.5rem">Stockists</a>
        <a href="/privacy"   class="label muted muted-link" style="padding-block:0.5rem">Privacy</a>
        <a href="/terms"    class="label muted muted-link" style="padding-block:0.5rem">Terms</a>
      </nav>
      <span class="label muted hidden sm:block">{SITE.ateliers.map(a => a.city).join(' · ')}</span>
    </div>
  </div>
</footer>