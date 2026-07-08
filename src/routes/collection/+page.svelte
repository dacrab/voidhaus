<script lang="ts">
  import ProductCard from '$lib/components/ProductCard.svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import type { Product } from '$lib/data/products';

  let { data } = $props();
  const products = $derived(data.products);
  const categories = $derived(data.categories);

  let activeCategory = $state('All');
  let filtered = $derived(
    activeCategory === 'All'
      ? products
      : products.filter((p: Product) => p.category === activeCategory)
  );
</script>

<svelte:head>
  <title>Collection — VOIDHAUS</title>
</svelte:head>

<PageHeader label="SS 2026" title="Collection" aside="{products.length} pieces" />

<div class="wrap">
  <div class="rule"></div>
  <nav class="cat-filters" aria-label="Category filters">
    {#each categories as cat}
      <button
        class="cat-filter label"
        class:cat-filter--active={activeCategory === cat}
        onclick={() => (activeCategory = cat)}
        aria-pressed={activeCategory === cat}
      >
        {cat}
        {#if activeCategory === cat}
          <span class="cat-filter-rule" aria-hidden="true"></span>
        {/if}
      </button>
    {/each}
  </nav>
</div>

<div class="product-grid" data-anim="scroll">
  {#each filtered as product (product.slug)}
    <ProductCard
      slug={product.slug}
      num={product.num}
      name={product.name}
      price={product.price}
      img={product.img}
      img2={product.img2}
      category={product.category}
    />
  {/each}
</div>

<style>
  .cat-filters {
    display: flex; flex-wrap: wrap; gap: 0;
    padding-block: var(--spacing-lg);
  }
  .cat-filter {
    position: relative;
    background: none; border: none; padding: 0.5rem 0;
    margin-right: var(--spacing-lg);
    opacity: var(--op-muted);
    transition: opacity var(--duration-fast);
    cursor: pointer;
  }
  .cat-filter:hover { opacity: 0.6; }
  .cat-filter--active { opacity: 1; }
  .cat-filter-rule {
    position: absolute; bottom: 0; left: 0; right: 0;
    height: 1px; background: var(--color-ink);
    animation: rule-in 0.4s var(--ease-out) both;
    transform-origin: left;
  }
  @keyframes rule-in {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
</style>
