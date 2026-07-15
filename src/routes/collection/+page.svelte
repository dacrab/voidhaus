<script lang="ts">
  import ProductCard from '$lib/components/ProductCard.svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import { filterProducts } from '$lib/data/filter';

  let { data } = $props();
  const products = $derived(data.products);
  const categories = $derived(data.categories);

  let activeCategory = $state('All');
  let search = $state('');
  let filtered = $derived(filterProducts(products, search, activeCategory));
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
  <div class="search-wrap">
    <label for="collection-search" class="sr-only">Search products</label>
    <input
      id="collection-search"
      type="search"
      bind:value={search}
      class="search-input label"
      placeholder="Search by name, material, origin…"
    />
  </div>
</div>

{#if filtered.length === 0}
  <p class="wrap label muted py-xl">No pieces match your search.</p>
{/if}

<div class="product-grid" data-anim="scroll">
  {#each filtered as product (product.slug)}
    <ProductCard {...product} />
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
  .search-wrap {
    padding-block-end: var(--spacing-lg);
  }
  .search-input {
    background: var(--color-off);
    border: 1px solid var(--color-rule);
    color: var(--color-ink);
    padding: 0.625rem 1rem;
    width: 100%;
    max-width: 28rem;
    outline: none;
    transition: border-color var(--duration-fast);
  }
  .search-input:focus {
    border-color: var(--color-mid);
  }
</style>
