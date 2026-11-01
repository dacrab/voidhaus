<script lang="ts">
  import ProductCard from "#lib/components/ProductCard.svelte";
  import { filterProducts, type CategoryFilter } from "#lib/data/filter.js";
  import { CATEGORIES, PRODUCTS } from "#lib/data/products.js";
  import { SITE } from "#lib/data/site.js";
  import { revealGroup } from "#lib/utils/scroll-observer.js";

  const filters: readonly CategoryFilter[] = ["All", ...CATEGORIES];

  let activeCategory = $state<CategoryFilter>("All");
  let search = $state("");

  const filtered = $derived(filterProducts(PRODUCTS, search, activeCategory));
  const counts = $derived(
    Object.fromEntries(
      filters.map((category) => [
        category,
        category === "All" ? PRODUCTS.length : PRODUCTS.filter((product) => product.category === category).length,
      ]),
    ) as Record<CategoryFilter, number>,
  );
</script>

<svelte:head>
  <title>The Index — VOIDHAUS</title>
  <meta
    name="description"
    content="The complete Voidhaus index: twelve objects for the body and the room, cut in Antwerp, Florence, Milan, and Tokyo."
  />
</svelte:head>

<header class="index-head wrap">
  <div class="index-top" data-anim="hero">
    <span class="label">Index / {SITE.season}</span>
    <span class="label">Twelve objects</span>
  </div>
  <h1 class="index-title" data-anim="hero" data-delay="0.08">The Index</h1>
  <div class="index-intro" data-anim="hero" data-delay="0.16">
    <p>
      A fixed catalogue. Outerwear, bodies, objects. No seasonal edit, no replenishment, no second colourway.
    </p>
    <span class="label index-range">001—012</span>
  </div>
</header>

<div class="wrap controls" data-anim="scroll" data-delay="0.04">
  <nav class="cat-filters" aria-label="Filter the index">
    {#each filters as category (category)}
      <button
        class="cat-filter label"
        class:cat-filter--active={activeCategory === category}
        type="button"
        onclick={() => (activeCategory = category)}
        aria-pressed={activeCategory === category}
      >
        <span>{category}</span>
        <span class="cat-count">{String(counts[category]).padStart(2, "0")}</span>
      </button>
    {/each}
  </nav>
  <div class="search-wrap">
    <label for="collection-search" class="sr-only">Search the index</label>
    <input
      id="collection-search"
      type="search"
      bind:value={search}
      class="field"
      placeholder="Query — name, material, origin"
    />
  </div>
</div>

<div class="wrap result-line" data-anim="scroll" data-delay="0.1">
  <span class="label" aria-live="polite">{String(filtered.length).padStart(2, "0")} / {PRODUCTS.length} objects</span>
  <span class="label muted">Colour on touch</span>
</div>

{#if filtered.length === 0}
  <div class="wrap empty" role="status">
    <span class="empty-mark" aria-hidden="true">∅</span>
    <p class="label">Nothing in the index matches that query.</p>
    <button class="label muted-link" type="button" onclick={() => { search = ""; activeCategory = "All"; }}>
      Reset the index
    </button>
  </div>
{:else}
  <div class="wrap">
    <div class="index-grid" data-reveal-group use:revealGroup>
      {#each filtered as product (product.slug)}
        <ProductCard {product} />
      {/each}
    </div>
  </div>
{/if}

<div class="wrap index-end">
  <span class="label muted">End of index</span>
  <span class="label muted">VOIDHAUS — {SITE.season}</span>
</div>

<style>
  .index-head {
    padding-top: var(--page-top-lg);
    padding-bottom: var(--spacing-2xl);
  }
  .index-top {
    display: flex;
    justify-content: space-between;
    gap: var(--spacing-md);
    padding-bottom: var(--spacing-sm);
    border-bottom: 1px solid var(--color-rule);
  }
  .index-title {
    margin-top: clamp(1.5rem, 4vw, 3rem);
    font-size: clamp(4rem, 13.5vw, 15rem);
    font-variation-settings: var(--fw-light);
    letter-spacing: -0.07em;
    line-height: 0.78;
    text-transform: uppercase;
  }
  .index-intro {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--spacing-2xl);
    margin-top: clamp(1.5rem, 4vw, 3rem);
  }
  .index-intro p {
    max-width: 46ch;
    color: var(--color-soft);
    font-size: 0.9375rem;
    line-height: 1.8;
  }
  .index-range { flex-shrink: 0; color: var(--color-mid); }

  .controls {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--spacing-xl);
    padding-bottom: var(--spacing-lg);
  }
  .cat-filters {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
  }
  .cat-filter {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    padding: 0.55rem 0.7rem;
    border: 1px solid var(--color-rule);
    background: none;
    color: var(--color-soft);
    cursor: pointer;
    transition:
      color var(--duration-fast) var(--ease-out),
      background var(--duration-fast) var(--ease-out),
      border-color var(--duration-fast) var(--ease-out);
  }
  .cat-filter:hover { color: var(--color-ink); border-color: var(--color-soft); }
  .cat-filter--active {
    background: var(--color-ink);
    border-color: var(--color-ink);
    color: var(--color-canvas);
  }
  .cat-count { color: var(--color-mid); font-size: 0.625rem; }
  .cat-filter--active .cat-count { color: var(--color-canvas); opacity: 0.55; }

  .search-wrap { flex-shrink: 0; width: min(100%, 22rem); }
  .search-wrap .field { padding-top: 0.35rem; }

  .result-line {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--spacing-md);
    padding-bottom: var(--spacing-sm);
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-lg);
    padding-block: var(--spacing-4xl);
    border-top: 1px solid var(--color-rule);
  }
  .empty-mark {
    font-size: clamp(5rem, 18vw, 14rem);
    font-variation-settings: var(--fw-light);
    line-height: 0.7;
    color: var(--color-rule);
  }
  .empty button { cursor: pointer; }

  .index-end {
    display: flex;
    justify-content: space-between;
    gap: var(--spacing-md);
    padding-top: var(--spacing-2xl);
    padding-bottom: var(--spacing-3xl);
    border-top: 1px solid var(--color-rule);
    margin-top: var(--spacing-lg);
  }

  @media (max-width: 767px) {
    .controls { flex-direction: column; }
    .search-wrap { width: 100%; max-width: none; }
    .index-intro { flex-direction: column; align-items: flex-start; gap: var(--spacing-md); }
    .index-range { display: none; }
  }
</style>
