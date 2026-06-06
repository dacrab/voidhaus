<script lang="ts">
  import { IMAGES } from '$lib/data/images';
  import { SITE } from '$lib/data/site';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import CTAStrip from '$lib/components/CTAStrip.svelte';

  const atelier = IMAGES['atelier'];
</script>

<svelte:head>
  <title>Manifesto — VOIDHAUS</title>
</svelte:head>

<PageHeader label="About" title="Manifesto" />

<div class="wrap" data-anim="scroll">
  <div class="rule"></div>
  <div class="grid gap-2xl md:grid-cols-2 md:gap-4xl items-start py-2xl md:py-3xl">
    <div class="overflow-hidden">
      <img
        class="js-atelier-img w-full aspect-[4/5] object-cover bg-[var(--color-off)]"
        src={atelier}
        alt="Voidhaus atelier"
        loading="lazy"
        decoding="async"
        width="900"
        height="1125"
      />
    </div>
    <div class="flex flex-col gap-xl">
      <div class="flex flex-col gap-sm">
        <span class="label muted" data-anim="hero">Philosophy</span>
        <p class="serif text-xl md:text-2xl fw-light leading-[1.3]" data-anim="hero" data-delay="0.1">
          We do not design for seasons.<br/>
          We design for silence.
        </p>
      </div>
      <div class="flex flex-col gap-md" data-anim="hero" data-delay="0.2">
        <p class="text-[var(--color-soft)] leading-[1.85] max-w-[52ch]">
          Voidhaus exists at the intersection of restraint and intent. Each piece begins as a question — What remains when everything unnecessary is taken away? — and ends as an answer worn close to the body.
        </p>
        <p class="text-[var(--color-soft)] leading-[1.85] max-w-[52ch]">
          Our ateliers in Milan, Antwerp, Florence, and Tokyo share a single discipline: no excess, no compromise, no ornament without purpose. The result is a wardrobe that exists outside of time — twelve pieces, four cities, one position.
        </p>
      </div>
    </div>
  </div>
</div>

<div class="wrap" data-anim="scroll">
  <div class="rule"></div>
  <div class="flex flex-col gap-xl py-2xl md:py-3xl">
    <span class="label muted">Ateliers</span>
    <div class="grid gap-xl md:grid-cols-4 md:gap-4xl">
      {#each SITE.ateliers as atelier}
        <div class="flex flex-col gap-xs" data-anim="hero">
          <span class="fw-medium">{atelier.city}</span>
          <span class="label muted">{atelier.specialty}</span>
        </div>
      {/each}
    </div>
  </div>
</div>

<CTAStrip label="Visit" linkText="Stockists" href="/stockists" />