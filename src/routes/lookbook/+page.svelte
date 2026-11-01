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
      text: "A coat you never take off indoors. Double-faced cashmere, American shoulders, self-belt at the waist. It marks the threshold between the world and your body.",
    },
    {
      id: "trousers",
      title: "The Trouser",
      num: "02",
      product: requireProduct("ash-trousers"),
      text: "Wide-leg wool gabardine that falls from the hip without grabbing. Pressed crease, slash pockets, extended tab. The trouser as architecture.",
    },
    {
      id: "boots",
      title: "The Boot",
      num: "03",
      product: requireProduct("eclipse-boots"),
      text: "Knee-high in matte calfskin. Stacked heel, elastic side panels. The leather will mark — that is the finish. Wear becomes surface.",
    },
  ];
</script>

<svelte:head>
  <title>Lookbook — VOIDHAUS</title>
</svelte:head>

<PageHeader label={SITE.season} title="Lookbook" />

<div class="wrap">
  <div class="rule"></div>
</div>

<div class="flex flex-col">
  {#each chapters as chapter, index (chapter.id)}
    {@const image = productImage(chapter.product.img)}
    <section class="chapter" data-anim="scroll" class:odd={index % 2 !== 0}>
      <div class="chapter-img-wrap">
        <img
          class="w-full h-full object-cover"
          src={image.src}
          srcset={image.srcset}
          sizes="(min-width: 768px) 50vw, 100vw"
          alt="{chapter.title} — {chapter.product.name} — No. {chapter.product.num}"
          loading="lazy"
          decoding="async"
          width="1200"
          height="1800"
        />
        <div class="chapter-num" aria-hidden="true">{chapter.num}</div>
      </div>
      <div class="wrap py-2xl md:py-3xl flex flex-col justify-center">
        <div class="flex flex-col gap-sm max-w-[56ch]">
          <div class="chapter-progress">
            <span class="label muted">Chapter</span>
            {#each chapters as other, dotIndex (other.id)}
              <span class="dot" class:active={dotIndex === index} aria-hidden="true"></span>
            {/each}
          </div>
          <span class="label muted pt-xs">{chapter.product.name} — No. {chapter.product.num}</span>
          <h2 class="serif text-3xl md:text-4xl fw-light leading-[1.1]">{chapter.title}</h2>
          <p class="text-soft leading-[1.85] pt-sm max-w-[48ch]">{chapter.text}</p>
        </div>
        <div class="mt-xl">
          <a href="/collection" class="label muted muted-link">View collection →</a>
        </div>
      </div>
    </section>
  {/each}
</div>

<CTAStrip label="Collection" linkText="View all pieces" href="/collection" />

<style>
  .chapter { border-bottom: 1px solid var(--color-rule); }
  .chapter-img-wrap {
    position: relative;
    width: 100vw;
    margin-inline: calc(50% - 50vw);
    aspect-ratio: 16 / 9;
    max-height: 70svh;
    overflow: hidden;
  }
  .chapter-num {
    position: absolute; top: var(--spacing-lg); right: var(--spacing-lg);
    font-size: clamp(3rem, 10vw, 8rem);
    font-variation-settings: var(--fw-light);
    letter-spacing: -0.04em;
    line-height: 1;
    color: var(--ot-primary);
    opacity: 0.25;
    pointer-events: none;
  }
  @media (min-width: 768px) {
    .chapter { display: grid; grid-template-columns: 1fr 1fr; }
    .chapter.odd .chapter-img-wrap { order: 1; }
    .chapter-img-wrap { aspect-ratio: auto; height: 100%; max-height: 80svh; }
  }
</style>
