<script lang="ts">
  import PageHeader from "#lib/components/PageHeader.svelte";
  import ProductCard from "#lib/components/ProductCard.svelte";
  import { filterProducts, type CategoryFilter } from "#lib/data/filter.js";
  import { CATEGORIES, PRODUCTS } from "#lib/data/products.js";
  import { SITE } from "#lib/data/site.js";

  const filters: readonly CategoryFilter[] = ["All", ...CATEGORIES];

  let activeCategory = $state<CategoryFilter>("All");
  let search = $state("");

  const filtered = $derived(filterProducts(PRODUCTS, search, activeCategory));
</script>

<svelte:head>
  <title>Collection — VOIDHAUS</title>
</svelte:head>

<PageHeader label={SITE.season} title="Collection" aside="{PRODUCTS.length} pieces" />

<div class="wrap">
  <div class="rule"></div>
  <nav class="cat-filters" aria-label="Category filters">
    {#each filters as category (category)}
      <button
        class="cat-filter label"
        class:cat-filter--active={activeCategory === category}
        type="button"
        onclick={() => (activeCategory = category)}
        aria-pressed={activeCategory === category}
      >
        {category}
        {#if activeCategory === category}
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
      class="field label"
      placeholder="Search by name, material, origin…"
    />
  </div>
</div>

{#if filtered.length === 0}
  <p class="wrap label muted py-xl">No pieces match your search.</p>
{/if}

<div class="product-grid" data-anim="scroll">
  {#each filtered as product (product.slug)}
    <ProductCard {product} />
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
  .search-wrap .field {
    max-width: 28rem;
  }
</style>
