<script lang="ts">
  import PageHeader from '$lib/components/PageHeader.svelte';
  import { SITE } from '$lib/data/site';

  let { data } = $props();
  const regions = $derived(data.stockists);
</script>

<svelte:head>
  <title>Stockists — VOIDHAUS</title>
</svelte:head>

<PageHeader label="Retail" title="Stockists" />

<div class="wrap">
  <div class="rule"></div>
  <div class="stockists-grid">
    {#each regions as region}
      <section class="stockist-region" data-anim="scroll">
        <span class="label muted stockist-region-label">{region.region}</span>
        <div class="stockist-stores">
          {#each region.stores as store}
            <div class="stockist-store">
              <div class="stockist-store-header">
                <span class="stockist-name">{store.name}</span>
                <span class="label muted">{store.city}</span>
              </div>
              <span class="stockist-address">{store.address}, {store.country}</span>
            </div>
          {/each}
        </div>
      </section>
    {/each}
  </div>

  <div class="rule"></div>
  <div class="stockist-inquiry" data-anim="scroll">
    <span class="label muted">Atelier inquiries</span>
    <div class="flex items-baseline justify-between flex-wrap gap-sm">
      <span class="fw-normal text-[var(--color-soft)]">{SITE.ateliers.map(a => `${a.city} — ${a.specialty}`).join(' · ')}</span>
      <a href="/contact" class="label muted muted-link">Contact →</a>
    </div>
  </div>
</div>

<style>
  .stockists-grid {
    padding-block: var(--spacing-2xl) var(--spacing-3xl);
    display: flex; flex-direction: column; gap: var(--spacing-4xl);
  }
  @media (min-width: 768px) { .stockists-grid { gap: var(--spacing-5xl); } }
  .stockist-region-label {
    display: block;
    padding-bottom: var(--spacing-lg);
    border-bottom: 1px solid var(--color-rule);
  }
  .stockist-stores {
    display: grid;
    gap: 1px;
    background: var(--color-rule);
    border: 1px solid var(--color-rule);
  }
  @media (min-width: 768px) { .stockist-stores { grid-template-columns: repeat(2, 1fr); } }
  .stockist-store {
    background: var(--color-white);
    padding: var(--spacing-lg);
    display: flex; flex-direction: column; gap: var(--spacing-xs);
  }
  .stockist-store-header {
    display: flex; align-items: baseline; justify-content: space-between; gap: var(--spacing-md);
  }
  .stockist-name {
    font-variation-settings: var(--fw-normal);
    color: var(--color-ink);
  }
  .stockist-address {
    font-size: var(--text-sm);
    color: var(--color-soft);
  }
  .stockist-inquiry {
    padding-block: var(--spacing-lg) var(--spacing-3xl);
    display: flex; flex-direction: column; gap: var(--spacing-md);
  }
</style>
