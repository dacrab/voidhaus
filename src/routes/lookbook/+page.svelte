<script lang="ts">
  import { IMAGES } from '$lib/data/images';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import CTAStrip from '$lib/components/CTAStrip.svelte';

  const chapters = [
    { id: 'coat', title: 'The Coat', subtitle: 'Obsidian Coat — No. 001', num: '01', img: IMAGES['coat-primary'], text: 'A coat you never take off indoors. Double-faced cashmere, American shoulders, self-belt at the waist. It marks the threshold between the world and your body.' },
    { id: 'trousers', title: 'The Trouser', subtitle: 'Ash Trousers — No. 003', num: '02', img: IMAGES['trousers-primary'], text: 'Wide-leg wool gabardine that falls from the hip without grabbing. Pressed crease, slash pockets, extended tab. The trouser as architecture.' },
    { id: 'boots', title: 'The Boot', subtitle: 'Eclipse Boots — No. 012', num: '03', img: IMAGES['boots-primary'], text: 'Knee-high in matte calfskin. Stacked heel, elastic side panels. The leather will mark — that is the finish. Wear becomes surface.' },
  ];
</script>

<svelte:head>
  <title>Lookbook — VOIDHAUS</title>
</svelte:head>

<PageHeader label="SS 2026" title="Lookbook" />

<div class="wrap">
  <div class="rule"></div>
</div>

<div class="flex flex-col">
  {#each chapters as chapter, i}
    <section class="chapter" data-anim="scroll" class:odd={i % 2 !== 0}>
      <div class="chapter-img-wrap">
        <img
          class="js-img w-full h-full object-cover"
          src={chapter.img}
          alt="{chapter.title} — {chapter.subtitle}"
          loading="lazy"
          decoding="async"
          width="1800"
          height="1013"
        />
        <div class="chapter-num" aria-hidden="true">{chapter.num}</div>
      </div>
      <div class="wrap py-2xl md:py-3xl flex flex-col justify-center">
        <div class="flex flex-col gap-sm max-w-[56ch]">
          <div class="chapter-progress">
            <span class="label muted">Chapter</span>
            {#each chapters as _, ci}
              <span class="dot" class:active={ci === i} aria-hidden="true"></span>
            {/each}
          </div>
          <span class="label muted" style="margin-top: var(--spacing-xs)">{chapter.subtitle}</span>
          <h2 class="serif text-3xl md:text-4xl fw-light leading-[1.1]">{chapter.title}</h2>
          <p class="text-[var(--color-soft)] leading-[1.85] pt-sm max-w-[48ch]">{chapter.text}</p>
        </div>
        <div class="mt-xl">
          <a href="/collection?{chapter.id}" class="label muted muted-link">View collection →</a>
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
    .chapter.odd { direction: rtl; }
    .chapter.odd > * { direction: ltr; }
    .chapter-img-wrap { aspect-ratio: auto; height: 100%; max-height: 80svh; }
  }
</style>
