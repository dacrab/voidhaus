<script lang="ts">
  import CTAStrip from "#lib/components/CTAStrip.svelte";
  import PageHeader from "#lib/components/PageHeader.svelte";
  import { SITE_IMAGES } from "#lib/data/products.js";
  import { SITE } from "#lib/data/site.js";
  import { productImage } from "#lib/images.js";

  const atelierImage = productImage(SITE_IMAGES.atelier);

  const tenets = [
    { num: "01", title: "No season", text: "The index does not expire. Twelve objects remain until they are gone." },
    {
      num: "02",
      title: "No lining",
      text: "Construction is the finish. What you see on the inside is what holds it together.",
    },
    { num: "03", title: "No ornament", text: "If it does not change the silhouette, it is removed." },
    {
      num: "04",
      title: "No explanation",
      text: "The work should not need a paragraph. This one is already too long.",
    },
  ];
</script>

<svelte:head>
  <title>Manifesto — VOIDHAUS</title>
  <meta
    name="description"
    content="Voidhaus is a house of subtraction: twelve objects per cycle, cut in Antwerp and finished in Florence."
  />
</svelte:head>

<PageHeader label="Studio" title="Manifesto" aside="Est. Milan" />

<div class="wrap">
  <div class="manifesto-grid" data-stagger>
    <div class="manifesto-image">
      <img
        src={atelierImage.src}
        srcset={atelierImage.srcset}
        sizes="(min-width: 900px) 46vw, 100vw"
        alt="Voidhaus atelier"
        loading="lazy"
        decoding="async"
        width="900"
        height="1125"
      />
      <span class="label manifesto-caption">Fig. 00 — The atelier / Antwerp</span>
    </div>
    <div class="manifesto-copy">
      <span class="label muted">Philosophy</span>
      <p class="manifesto-lead display">The void<br />is not empty.</p>
      <p>
        Voidhaus is a house of subtraction. Twelve objects per cycle. No seasons, no collections, no noise. Cut in
        Antwerp. Finished in Florence. Photographed in rooms that were already there.
      </p>
      <p>
        The work begins with what can be removed: lining, closure, colour, explanation. What remains is a silhouette,
        a weight, a way of standing. The rest is silence.
      </p>
      <p>
        We do not design for a moment. We design for the body that has to live in it.
      </p>
    </div>
  </div>
</div>

<section class="wrap tenets">
  <div class="section-head" data-anim="scroll">
    <span class="label">Tenets</span>
    <span class="label">01—04</span>
  </div>
  <div class="tenet-grid" data-stagger>
    {#each tenets as tenet (tenet.num)}
      <div class="tenet">
        <span class="label tenet-num">{tenet.num}</span>
        <h2 class="tenet-title">{tenet.title}</h2>
        <p>{tenet.text}</p>
      </div>
    {/each}
  </div>
</section>

<div class="wrap ateliers">
  <div class="section-head" data-anim="scroll">
    <span class="label">Ateliers</span>
    <span class="label">Four cities / one position</span>
  </div>
  <div class="atelier-grid" data-stagger>
    {#each SITE.ateliers as atelier (atelier.city)}
      <div class="atelier">
        <span class="atelier-city">{atelier.city}</span>
        <span class="label muted">{atelier.specialty}</span>
      </div>
    {/each}
  </div>
</div>

<CTAStrip label="Visit" linkText="Stockists" href="/stockists" />

<style>
  .manifesto-grid {
    display: grid;
    gap: var(--spacing-2xl);
    padding-block: var(--spacing-2xl) clamp(4rem, 8vw, 8rem);
    align-items: start;
  }
  .manifesto-image { position: relative; display: flex; flex-direction: column; gap: var(--spacing-sm); }
  .manifesto-image img {
    width: 100%;
    aspect-ratio: 4 / 5;
    object-fit: cover;
    filter: saturate(0.8) contrast(1.05) brightness(0.84);
  }
  .manifesto-caption { color: var(--color-mid); }
  .manifesto-copy { display: flex; flex-direction: column; gap: var(--spacing-lg); }
  .manifesto-lead {
    font-size: clamp(2.75rem, 6vw, 6rem);
    margin-block: var(--spacing-sm);
  }
  .manifesto-copy > p:not(.manifesto-lead) {
    max-width: 46ch;
    color: var(--color-soft);
    font-size: 0.9375rem;
    line-height: 1.9;
  }

  .tenets { padding-block: var(--spacing-2xl); border-top: 1px solid var(--color-rule); }
  .tenet-grid {
    display: grid;
    gap: var(--spacing-xl);
    padding-top: var(--spacing-xl);
  }
  .tenet { display: flex; flex-direction: column; gap: var(--spacing-sm); }
  .tenet-num { color: var(--color-mid); }
  .tenet-title {
    font-size: clamp(1.5rem, 2.4vw, 2.25rem);
    font-variation-settings: var(--fw-normal);
    letter-spacing: -0.03em;
    line-height: 1;
    text-transform: uppercase;
  }
  .tenet p { color: var(--color-soft); font-size: 0.875rem; line-height: 1.75; max-width: 32ch; }

  .ateliers { padding-block: var(--spacing-2xl) var(--spacing-3xl); }
  .atelier-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-xl);
    padding-top: var(--spacing-xl);
  }
  .atelier { display: flex; flex-direction: column; gap: var(--spacing-xs); }
  .atelier-city {
    font-size: clamp(1.5rem, 3vw, 2.5rem);
    font-variation-settings: var(--fw-light);
    letter-spacing: -0.04em;
    line-height: 1;
    text-transform: uppercase;
  }

  @media (min-width: 900px) {
    .manifesto-grid { grid-template-columns: minmax(0, 6fr) minmax(0, 6fr); gap: clamp(3rem, 7vw, 8rem); }
    .manifesto-copy { padding-top: var(--spacing-xl); }
    .tenet-grid { grid-template-columns: repeat(4, 1fr); }
    .atelier-grid { grid-template-columns: repeat(4, 1fr); }
  }
</style>
