<script lang="ts">
  import { afterNavigate } from '$app/navigation';
  import { IMAGES } from '$lib/data/images';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import CTAStrip from '$lib/components/CTAStrip.svelte';

  let { data } = $props();
  const products = $derived(data.products);
  const featured = $derived(products.slice(0, 4));
  const hero = IMAGES['hero'];
  const editorial = IMAGES['editorial'];
  const season = $derived(data.site.season);

  function runAnimations() {
    const heroTexts = ['.js-hero-season', '.js-hero-cta', '.js-hero-tagline'];
    heroTexts.forEach((sel, i) => {
      const el = document.querySelector<HTMLElement>(sel);
      if (el) { el.style.transitionDelay = `${0.3 + i * 0.15}s`; el.classList.add('in-view'); }
    });
    const lines = document.querySelectorAll<HTMLElement>('.hero-brand-line');
    lines.forEach((el, i) => {
      el.style.transitionDelay = `${0.4 + i * 0.12}s`;
      el.classList.add('in-view');
    });
  }

  afterNavigate(runAnimations);
</script>

<svelte:head>
  <title>VOIDHAUS</title>
  <meta property="og:image" content="/img/hero.jpg" />
  <meta name="twitter:image" content="/img/hero.jpg" />
</svelte:head>

<section class="hero">
  <img
    class="js-hero-img absolute inset-0 w-full h-full"
    src={hero}
    alt="VOIDHAUS {season}"
    fetchpriority="high"
    decoding="async"
    width="1800"
    height="1013"
  />
  <div class="hero-scrim scrim"></div>
  <div class="relative z-10 flex flex-col h-full">
    <span class="label js-hero-season ot-secondary hero-season">{season}</span>
    <div class="hero-brand">
      <div class="hero-brand-line fw-light ot-primary">VOID</div>
      <div class="hero-brand-line fw-light ot-primary">HAUS</div>
    </div>
    <div class="wrap flex items-baseline justify-between pb-2xl border-t border-rule pt-md mt-auto">
      <span class="scroll-indicator label js-hero-cta ot-muted tracking-[0.3em]">
        <span class="scroll-line"></span>Scroll
      </span>
      <span class="label js-hero-tagline ot-muted hidden sm:block">Twelve pieces. One position.</span>
    </div>
  </div>
</section>

<section class="wrap py-4xl md:py-5xl">
  <div class="flex items-center justify-between pb-md">
    <span class="label muted">{season} — New Arrivals</span>
    <a href="/collection" class="label muted muted-link">All ({products.length}) →</a>
  </div>
  <div class="rule"></div>
  <div class="product-grid featured-grid">
    {#each featured as p}
      <ProductCard {...p} />
    {/each}
  </div>
</section>

<section class="editorial" data-anim="scroll">
  <div class="absolute inset-0">
    <img
      class="ed-img"
      src={editorial}
      alt="Voidhaus editorial {season}"
      loading="lazy"
      decoding="async"
      width="1800"
      height="1013"
    />
    <div class="ed-scrim scrim"></div>
  </div>
  <div class="wrap ed-text flex flex-col gap-lg">
    <p class="serif ed-quote ot-primary italic leading-[1.12] tracking-tight">"The most radical act<br/>is <em class="not-italic ot-muted">silence.</em>"</p>
    <a href="/about" class="label ot-secondary transition-colors duration-[var(--duration-fast)] hover:text-white">Read manifesto →</a>
  </div>
</section>

<CTAStrip label="Press & Inquiries" linkText="studio@voidhaus.com" href="/contact" />

<style>
  .hero {
    position: relative;
    width: 100vw;
    height: 100svh;
    min-height: 600px;
    margin-inline: calc(50% - 50vw);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    overflow: hidden;
  }
  .hero-scrim {
    position: absolute; inset: 0; pointer-events: none;
    background:
      linear-gradient(to bottom, transparent 20%, var(--scrim-heavy) 100%),
      linear-gradient(to top, transparent 92%, var(--scrim-light) 100%);
  }
  .hero-season {
    position: absolute;
    top: calc(var(--nav-h) + var(--spacing-lg));
    left: clamp(var(--spacing-lg), 5vw, var(--spacing-4xl));
  }
  .hero-brand {
    display: flex;
    flex-direction: column;
    padding-inline: clamp(var(--spacing-lg), 5vw, var(--spacing-4xl));
    padding-bottom: var(--spacing-lg);
    margin-top: auto;
  }
  .hero-brand-line {
    font-size: var(--text-hero);
    letter-spacing: -0.06em;
    line-height: 0.82;
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 1s var(--ease-out), transform 1s var(--ease-out);
  }
  .hero-brand-line:global(.in-view) {
    opacity: 1;
    transform: translateY(0);
  }
  .featured-grid { grid-template-columns: repeat(2, 1fr); }
  @media (min-width: 1024px) { .featured-grid { grid-template-columns: repeat(4, 1fr); } }
  .editorial {
    position: relative;
    height: 75svh; min-height: 420px;
    margin-block: 7rem;
    overflow: hidden;
  }
  @media (min-width: 768px) { .editorial { height: 85svh; margin-block: 10rem; } }
  .ed-scrim { background: linear-gradient(135deg, var(--scrim-heavy) 0%, var(--scrim-light) 60%, transparent 100%); }
  .ed-text {
    position: absolute;
    bottom: 3rem; inset-inline: 0;
  }
  @media (min-width: 768px) { .ed-text { bottom: 4rem; max-width: 45%; } }
  .ed-quote { font-size: clamp(1.75rem, 5vw, 4rem); }
</style>
