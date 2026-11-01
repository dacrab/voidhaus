<script lang="ts">
  import CTAStrip from "#lib/components/CTAStrip.svelte";
  import PageHeader from "#lib/components/PageHeader.svelte";
  import { requireProduct } from "#lib/data/products.js";
  import { SITE } from "#lib/data/site.js";
  import { productImage } from "#lib/images.js";

  const chapters = [
    {
      id: "coat",
      title: "The Coat",
      num: "01",
      product: requireProduct("obsidian-coat"),
      text: "A floor-length coat in double-faced cashmere. No lining. No closure. The fabric is the architecture. Belt it, or let it open.",
    },
    {
      id: "body",
      title: "The Body",
      num: "02",
      product: requireProduct("net-body"),
      text: "Hand-knotted net, cut away at the ribs and the hip. It is not underwear. It is not outerwear. It is the space between.",
    },
    {
      id: "room",
      title: "The Room",
      num: "03",
      product: requireProduct("readymade-chair"),
      text: "A found chair in moulded polypropylene. Edition of twelve. The only object in the index that does not ask for a body.",
    },
  ];
</script>

<svelte:head>
  <title>Lookbook — VOIDHAUS</title>
  <meta
    name="description"
    content="Three chapters from the Voidhaus index: the coat, the body, and the room. Photographed in Antwerp."
  />
</svelte:head>

<PageHeader label="{SITE.season} — Campaign" title="Lookbook" aside="Three chapters" />

<div class="flex flex-col">
  {#each chapters as chapter, index (chapter.id)}
    {@const image = productImage(chapter.product.img)}
    <section class="chapter" data-stagger class:odd={index % 2 !== 0}>
      <div class="chapter-img-wrap">
        <img
          class="w-full h-full object-cover"
          src={image.src}
          srcset={image.srcset}
          sizes="(min-width: 900px) 58vw, 100vw"
          alt="{chapter.title} — {chapter.product.name} — No. {chapter.product.num}"
          loading="lazy"
          decoding="async"
          width="1200"
          height="1800"
        />
        <div class="chapter-num" aria-hidden="true">{chapter.num}</div>
        <div class="chapter-caption label">
          <span>Fig. {chapter.product.num}</span>
          <span>{chapter.product.name}</span>
        </div>
      </div>
      <div class="chapter-text wrap">
        <div class="chapter-copy">
          <div class="chapter-progress">
            <span class="label muted">Chapter</span>
            {#each chapters as other, dotIndex (other.id)}
              <span class="dot" class:active={dotIndex === index} aria-hidden="true"></span>
            {/each}
          </div>
          <span class="label muted pt-xs">{chapter.product.num} — {chapter.product.category}</span>
          <h2 class="chapter-title">{chapter.title}</h2>
          <p class="chapter-body">{chapter.text}</p>
          <a href="/product/{chapter.product.slug}" class="label muted-link chapter-link">View the object →</a>
        </div>
      </div>
    </section>
  {/each}
</div>

<CTAStrip label="The Index" linkText="View all twelve objects" href="/collection" />

<style>
  .chapter { border-bottom: 1px solid var(--color-rule); }
  .chapter-img-wrap {
    position: relative;
    width: 100vw;
    margin-inline: calc(50% - 50vw);
    aspect-ratio: 16 / 9;
    max-height: 72svh;
    overflow: hidden;
    background: var(--color-surface);
  }
  .chapter-img-wrap img {
    filter: saturate(0.82) contrast(1.05) brightness(0.85);
    transition:
      filter var(--duration-slow) var(--ease-img),
      transform var(--duration-slow) var(--ease-out);
  }
  @media (hover: hover) {
    .chapter:hover .chapter-img-wrap img {
      filter: saturate(0.95) contrast(1.04) brightness(0.9);
      transform: scale(1.02);
    }
  }
  .chapter-num {
    position: absolute; top: var(--spacing-lg); right: var(--spacing-lg);
    font-size: clamp(3rem, 10vw, 8rem);
    font-variation-settings: var(--fw-light);
    letter-spacing: -0.04em;
    line-height: 1;
    color: var(--ot-primary);
    opacity: 0.35;
    pointer-events: none;
  }
  .chapter-caption {
    position: absolute;
    inset-inline: var(--spacing-lg);
    bottom: var(--spacing-lg);
    display: flex;
    justify-content: space-between;
    gap: var(--spacing-md);
    color: var(--ot-secondary);
    text-shadow: 0 1px 12px rgb(0 0 0 / 0.55);
  }
  .chapter-text { padding-block: var(--spacing-2xl); }
  .chapter-copy { display: flex; flex-direction: column; gap: var(--spacing-sm); max-width: 52ch; }
  .chapter-title {
    font-size: clamp(2.5rem, 5vw, 4.5rem);
    font-variation-settings: var(--fw-light);
    letter-spacing: -0.05em;
    line-height: 0.9;
    text-transform: uppercase;
    margin-top: var(--spacing-xs);
  }
  .chapter-body {
    max-width: 46ch;
    color: var(--color-soft);
    font-size: 0.9375rem;
    line-height: 1.85;
    margin-top: var(--spacing-sm);
  }
  .chapter-link { align-self: flex-start; margin-top: var(--spacing-lg); }

  @media (min-width: 900px) {
    .chapter { display: grid; grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); }
    .chapter.odd { grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); }
    .chapter.odd .chapter-img-wrap { order: 1; }
    .chapter-img-wrap {
      width: 100%;
      margin-inline: 0;
      aspect-ratio: auto;
      height: 100%;
      min-height: 70svh;
      max-height: none;
    }
    .chapter-text { display: flex; align-items: center; padding-inline: clamp(2rem, 5vw, 5rem); }
    .chapter.odd .chapter-text { padding-inline: clamp(2rem, 5vw, 5rem); }
  }
</style>
