<script lang="ts">
  import CTAStrip from "#lib/components/CTAStrip.svelte";
  import ProductCard from "#lib/components/ProductCard.svelte";
  import { PRODUCTS, SITE_IMAGES } from "#lib/data/products.js";
  import { SITE } from "#lib/data/site.js";
  import { wideImage } from "#lib/images.js";
  import { SITE_URL } from "#lib/site-url.js";

  const featured = PRODUCTS.slice(0, 4);
  const hero = wideImage(SITE_IMAGES.hero);
  const editorial = wideImage(SITE_IMAGES.editorial);
  const socialImage = new URL(hero.src, SITE_URL).href;
</script>

<svelte:head>
  <title>VOIDHAUS</title>
  <meta property="og:image" content={socialImage} />
  <meta name="twitter:image" content={socialImage} />
</svelte:head>

<section class="hero">
  <img
    class="hero-img absolute inset-0 w-full h-full object-cover"
    src={hero.src}
    srcset={hero.srcset}
    sizes="100vw"
    alt="VOIDHAUS {SITE.season}"
    fetchpriority="high"
    decoding="async"
    width="1800"
    height="1013"
  />
  <div class="hero-scrim scrim"></div>
  <div class="relative z-10 flex flex-col h-full">
    <span class="label ot-secondary hero-season" data-anim="hero" data-delay="0.2">{SITE.season}</span>
    <div class="hero-brand">
      <div class="hero-brand-line fw-light ot-primary" data-anim="hero" data-delay="0.35">VOID</div>
      <div class="hero-brand-line fw-light ot-primary" data-anim="hero" data-delay="0.5">HAUS</div>
    </div>
    <div class="wrap flex items-baseline justify-between pb-2xl border-t border-rule pt-md mt-auto">
      <span class="scroll-indicator label ot-muted tracking-[0.3em]" data-anim="hero" data-delay="0.65">
        <span class="scroll-line"></span>Scroll
      </span>
      <span class="label ot-muted hidden sm:block" data-anim="hero" data-delay="0.7">Twelve pieces. One position.</span>
    </div>
  </div>
</section>

<section class="wrap py-4xl md:py-5xl">
  <div class="flex items-center justify-between pb-md">
    <span class="label muted">{SITE.season} — New Arrivals</span>
    <a href="/collection" class="label muted muted-link">All ({PRODUCTS.length}) →</a>
  </div>
  <div class="rule"></div>
  <div class="product-grid featured-grid" data-anim="scroll">
    {#each featured as product (product.slug)}
      <ProductCard {product} />
    {/each}
  </div>
</section>

<section class="editorial" data-anim="scroll">
  <div class="absolute inset-0">
    <img
      class="ed-img"
      src={editorial.src}
      srcset={editorial.srcset}
      sizes="100vw"
      alt="Voidhaus editorial {SITE.season}"
      loading="lazy"
      decoding="async"
      width="1800"
      height="1013"
    />
    <div class="ed-scrim scrim"></div>
  </div>
  <div class="wrap ed-text flex flex-col gap-lg">
    <p class="serif ed-quote ot-primary italic leading-[1.12] tracking-tight">
      "The most radical act<br />is <em class="not-italic ot-muted">silence.</em>"
    </p>
    <a href="/about" class="label ot-secondary ed-link">Read manifesto →</a>
  </div>
</section>

<CTAStrip label="Press & Inquiries" linkText={SITE.email.studio} href="/contact" />

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
  .ed-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .ed-scrim { background: linear-gradient(135deg, var(--scrim-heavy) 0%, var(--scrim-light) 60%, transparent 100%); }
  .ed-text {
    position: absolute;
    bottom: 3rem; inset-inline: 0;
  }
  @media (min-width: 768px) { .ed-text { bottom: 4rem; max-width: 45%; } }
  .ed-quote { font-size: clamp(1.75rem, 5vw, 4rem); }
  .ed-link { transition: color var(--duration-fast); }
  .ed-link:hover { color: var(--color-ink); }
</style>
