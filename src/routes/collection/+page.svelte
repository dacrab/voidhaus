<script lang="ts">
  import ProductCard from '$lib/components/ProductCard.svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';

  let { data } = $props();
  const products = $derived(data.products);
  const categories = $derived(data.categories);

  let activeCategory = $state('All');
  let filtered = $derived(
    activeCategory === 'All'
      ? products
      : products.filter((p: any) => p.category === activeCategory)
  );
</script>

<svelte:head>
  <title>Collection — VOIDHAUS</title>
</svelte:head>

<PageHeader label="SS 2026" title="Collection" aside="{products.length} pieces" />

<div class="wrap">
  <div class="rule"></div>
  <nav class="flex flex-wrap gap-md py-lg" aria-label="Category filters">
    {#each categories as cat}
      <button
        class="label transition-opacity duration-[var(--duration-fast)] {activeCategory === cat ? 'text-[var(--color-ink)] opacity-100' : 'muted-link'}"
        onclick={() => (activeCategory = cat)}
        aria-pressed={activeCategory === cat}
      >
        {cat}
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