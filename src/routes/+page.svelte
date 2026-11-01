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
    class="hero-img"
    src={hero.src}
    srcset={hero.srcset}
    sizes="100vw"
    alt="VOIDHAUS {SITE.season}"
    fetchpriority="high"
    decoding="async"
    width="1800"
    height="1013"
  />
  <div class="hero-shade"></div>
  <div class="hero-frame wrap">
    <div class="hero-top" data-anim="hero" data-delay="0.2">
      <span class="label ot-secondary">Index — {SITE.season}</span>
      <span class="label ot-secondary">Twelve objects</span>
    </div>
    <div class="hero-bottom">
      <p class="label ot-muted hero-line" data-anim="hero" data-delay="0.3">
        A study in absence / Milan — Antwerp — Florence — Tokyo
      </p>
      <h1 class="hero-title" data-anim="hero" data-delay="0.4">VOIDHAUS</h1>
      <div class="hero-foot" data-anim="hero" data-delay="0.55">
        <p class="hero-sub">Twelve objects for the body<br />and the room.</p>
        <a class="label ot-primary hero-enter" href="/collection">Enter the index <span aria-hidden="true">↘</span></a>
      </div>
    </div>
  </div>
</section>

<nav class="code-strip" aria-label="Product index">
  <div class="wrap code-strip-inner">
    <span class="label code-strip-label">Index</span>
    <div class="code-strip-links">
      {#each PRODUCTS as product (product.slug)}
        <a class="label code-link" href="/product/{product.slug}" aria-label="{product.num} — {product.name}">{product.num}</a>
      {/each}
    </div>
    <span class="label code-strip-label">001—012</span>
  </div>
</nav>

<section class="wrap statement">
  <div class="section-head" data-anim="scroll">
    <span class="label">01 / Position</span>
    <span class="label">No season</span>
  </div>
  <div class="statement-grid">
    <h2 class="statement-title display" data-anim="scroll">We dress<br />the absence.</h2>
    <div class="statement-copy" data-anim="scroll">
      <p>
        Voidhaus makes twelve objects per cycle. No seasonal drop. No mid-season edit. A fixed index of outerwear,
        bodies, and things for the room.
      </p>
      <p>
        Cut in Antwerp. Finished in Florence. Photographed in rooms that were already there. What remains after
        everything unnecessary is removed is the silhouette.
      </p>
      <a class="label muted-link statement-link" href="/about">Read the manifesto →</a>
    </div>
  </div>
</section>

<section class="wrap home-index-section">
  <div class="section-head" data-anim="scroll">
    <span class="label">02 / Selected objects</span>
    <a class="label muted-link" href="/collection">Full index ({PRODUCTS.length}) →</a>
  </div>
  <div class="home-index" data-anim="scroll">
    {#each featured as product (product.slug)}
      <ProductCard {product} />
    {/each}
  </div>
</section>

<section class="editorial" data-anim="scroll">
  <img
    class="ed-img"
    src={editorial.src}
    srcset={editorial.srcset}
    sizes="100vw"
    alt="Voidhaus campaign {SITE.season}"
    loading="lazy"
    decoding="async"
    width="1800"
    height="1013"
  />
  <div class="ed-scrim"></div>
  <div class="ed-frame wrap">
    <span class="label ot-secondary">Campaign / {SITE.season}</span>
    <p class="ed-statement display ot-primary">The body<br />is the room.</p>
    <div class="ed-foot">
      <span class="label ot-muted">Photographed in Antwerp</span>
      <a class="label ot-primary ed-link" href="/lookbook">View the lookbook →</a>
    </div>
  </div>
</section>

<section class="wrap service" data-anim="scroll">
  <div class="service-grid">
    <div class="service-item">
      <span class="label muted">Shipping</span>
      <p>Worldwide, 5–10 working days. Duties included.</p>
    </div>
    <div class="service-item">
      <span class="label muted">Ateliers</span>
      <p>{SITE.ateliers.map((atelier) => atelier.city).join(" — ")}</p>
    </div>
    <div class="service-item">
      <span class="label muted">Inquiries</span>
      <p><a class="muted-link" href="mailto:{SITE.email.studio}">{SITE.email.studio}</a></p>
    </div>
  </div>
</section>

<CTAStrip label="Studio" linkText="Contact" href="/contact" />

<style>
  .hero {
    position: relative;
    width: 100vw;
    height: 100svh;
    min-height: 620px;
    margin-inline: calc(50% - 50vw);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    overflow: hidden;
  }
  .hero-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 34%;
    filter: saturate(0.8) contrast(1.05) brightness(0.82);
  }
  .hero-shade {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(to bottom, rgb(0 0 0 / 0.45) 0%, transparent 24%),
      linear-gradient(to top, rgb(0 0 0 / 0.82) 0%, transparent 55%);
  }
  .hero-frame {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    padding-top: calc(var(--nav-h) + var(--spacing-lg));
    padding-bottom: var(--spacing-lg);
  }
  .hero-top { display: flex; justify-content: space-between; gap: var(--spacing-md); }
  .hero-bottom { display: flex; flex-direction: column; gap: var(--spacing-md); }
  .hero-line { letter-spacing: 0.1em; }
  .hero-title {
    font-size: var(--text-hero);
    font-variation-settings: var(--fw-light);
    letter-spacing: -0.075em;
    line-height: 0.74;
    text-transform: uppercase;
    white-space: nowrap;
    color: var(--ot-primary);
  }
  .hero-foot {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--spacing-lg);
    padding-top: var(--spacing-lg);
    border-top: 1px solid rgb(255 255 255 / 0.22);
  }
  .hero-sub {
    font-size: clamp(1rem, 1.4vw, 1.25rem);
    line-height: 1.35;
    color: var(--ot-primary);
  }
  .hero-enter {
    position: relative;
    padding-bottom: 0.15rem;
    border-bottom: 1px solid currentColor;
    white-space: nowrap;
  }

  .code-strip {
    border-bottom: 1px solid var(--color-rule);
    overflow-x: auto;
  }
  .code-strip-inner {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
    padding-block: 0.9rem;
    white-space: nowrap;
  }
  .code-strip-label { color: var(--color-mid); flex-shrink: 0; }
  .code-strip-links { display: flex; align-items: center; flex: 1; }
  .code-link {
    color: var(--color-soft);
    padding: 0.15rem 0.7rem;
    border-left: 1px solid var(--color-rule);
    transition: color var(--duration-fast), background var(--duration-fast);
  }
  .code-link:first-child { border-left: 0; }
  .code-link:hover { color: var(--color-ink); background: var(--color-surface); }

  .statement { padding-block: clamp(4rem, 9vw, 9rem); }
  .statement-grid {
    display: grid;
    gap: var(--spacing-2xl);
    padding-top: var(--spacing-2xl);
  }
  .statement-title { font-size: clamp(3rem, 7.5vw, 7.5rem); }
  .statement-copy {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    max-width: 40ch;
    color: var(--color-soft);
    font-size: 0.9375rem;
    line-height: 1.85;
  }
  .statement-link { align-self: flex-start; margin-top: var(--spacing-sm); }
  @media (min-width: 900px) {
    .statement-grid { grid-template-columns: repeat(12, 1fr); gap: var(--spacing-lg); align-items: start; }
    .statement-title { grid-column: 1 / 8; }
    .statement-copy { grid-column: 9 / 13; padding-top: 0.6rem; }
  }

  .home-index-section { padding-bottom: var(--spacing-2xl); }
  .home-index {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1px;
    margin-top: var(--spacing-lg);
    background: var(--color-rule);
    border: 1px solid var(--color-rule);
  }
  .home-index > :global(*) { min-width: 0; background: var(--color-canvas); }
  @media (min-width: 900px) {
    .home-index { grid-template-columns: repeat(12, minmax(0, 1fr)); }
    .home-index > :global(:nth-child(1)) { grid-column: span 7; }
    .home-index > :global(:nth-child(2)) { grid-column: span 5; }
    .home-index > :global(:nth-child(3)) { grid-column: span 5; }
    .home-index > :global(:nth-child(4)) { grid-column: span 7; }
  }

  .editorial {
    position: relative;
    height: 90svh;
    min-height: 480px;
    margin-block: clamp(4rem, 9vw, 9rem);
    overflow: hidden;
  }
  .ed-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 28%;
    filter: saturate(0.82) contrast(1.06) brightness(0.78);
  }
  .ed-scrim {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgb(0 0 0 / 0.1) 20%, rgb(0 0 0 / 0.78) 100%);
  }
  .ed-frame {
    position: absolute;
    inset: 0;
    z-index: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: var(--spacing-md);
    padding-bottom: clamp(1.5rem, 4vw, 3rem);
  }
  .ed-statement { font-size: clamp(3.5rem, 11vw, 10rem); }
  .ed-foot {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--spacing-md);
    margin-top: var(--spacing-lg);
    padding-top: var(--spacing-md);
    border-top: 1px solid rgb(255 255 255 / 0.24);
  }
  .ed-link { border-bottom: 1px solid rgb(255 255 255 / 0.4); padding-bottom: 0.1rem; }

  .service { padding-block: var(--spacing-2xl) var(--spacing-lg); }
  .service-grid {
    display: grid;
    gap: var(--spacing-xl);
    padding-top: var(--spacing-lg);
    border-top: 1px solid var(--color-rule);
  }
  .service-item { display: flex; flex-direction: column; gap: var(--spacing-sm); }
  .service-item p { color: var(--color-ink-soft); font-size: 0.9375rem; line-height: 1.6; }
  @media (min-width: 768px) {
    .service-grid { grid-template-columns: repeat(3, 1fr); gap: var(--spacing-2xl); }
  }

  @media (max-width: 600px) {
    .hero-foot { flex-direction: column; align-items: flex-start; }
    .code-strip-label:last-child { display: none; }
  }
</style>
