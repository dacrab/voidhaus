<script lang="ts">
  import { formatPrice, type CartItem } from '#lib/utils/cart.js';
  import SizeGuide from '#lib/components/SizeGuide.svelte';
  import ProductCard from '#lib/components/ProductCard.svelte';
  import PageHeader from '#lib/components/PageHeader.svelte';
  import { IMAGES } from '#lib/data/images.js';
  import { PRODUCTS, SHARED_DETAILS } from '#lib/data/products.js';
  let { data } = $props();
  const product = $derived(data.product);
  const mainImg = $derived(IMAGES[product.img] ?? '');
  const altImg = $derived(product.img2 ? IMAGES[product.img2] ?? '' : '');
  const related = $derived(PRODUCTS.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 3));

  let selectedSize = $state('');
  let added = $state(false);

  function addToCart() {
    if (!selectedSize) return;
    const item: CartItem = {
      slug: product.slug,
      name: product.name,
      price: product.price,
      size: selectedSize,
      img: mainImg,
      num: product.num,
    };
    window.dispatchEvent(new CustomEvent('vh:add-to-cart', { detail: item }));
    added = true;
    setTimeout(() => { added = false; }, 2000);
  }
</script>

<svelte:head>
  <title>{product.name} — VOIDHAUS</title>
  <meta property="og:title" content="{product.name} — VOIDHAUS" />
  <meta property="og:image" content={mainImg} />
</svelte:head>

<PageHeader label={product.num} title={product.name} aside={product.category} />

<div class="wrap">
  <div class="rule"></div>
</div>

<section class="wrap py-2xl md:py-3xl">
  <div class="grid gap-2xl md:grid-cols-2 md:gap-4xl">
    <div class="pdp-images">
      <img
        class="js-main-img w-full aspect-[3/4] object-cover object-top bg-off"
        src={mainImg}
        alt={product.name}
        width="900"
        height="1200"
      />
      {#if altImg}
        <img
          class="w-full aspect-[3/4] object-cover object-top bg-off mt-1"
          src={altImg}
          alt="{product.name} detail"
          loading="lazy"
          decoding="async"
          width="900"
          height="1200"
        />
      {/if}
    </div>

    <div data-pdp-info>
      <div class="flex flex-col gap-sm pb-lg border-b border-rule" data-anim="hero">
        <span class="label muted">{product.num} / {product.category}</span>
        <span class="serif text-2xl md:text-3xl fw-light">&euro; {formatPrice(product.price)}</span>
      </div>

      <p class="text-soft leading-[1.85] py-lg max-w-[52ch]" data-anim="hero" data-delay="0.1">{product.desc}</p>

      <div class="flex flex-col gap-sm pb-lg" data-anim="hero" data-delay="0.2">
        <span class="label muted">Material</span>
        <span class="fw-normal">{product.material}</span>
        <span class="label muted pt-sm">Origin</span>
        <span class="fw-normal">{product.origin}</span>
      </div>

      <div class="flex flex-col gap-sm pb-lg border-b border-rule" data-anim="hero" data-delay="0.3">
        <div class="flex items-center justify-between">
          <span class="label muted">Size</span>
          <SizeGuide category={product.category === 'Footwear' ? 'Footwear' : 'Clothing'} />
        </div>
        <div class="flex flex-wrap gap-sm">
          {#each product.sizes as size}
            <button
              class="size-btn {selectedSize === size ? 'size-btn--active' : ''}"
              onclick={() => (selectedSize = size)}
              aria-pressed={selectedSize === size}
            >
              {size}
            </button>
          {/each}
        </div>
      </div>

      <div class="pt-lg" data-anim="hero" data-delay="0.4">
        <button
          class="btn-outline {!selectedSize ? 'op-35 cursor-not-allowed' : ''}"
          onclick={addToCart}
          disabled={!selectedSize}
        >
          <span class="label">{added ? 'Added ✓' : 'Add to Selection'}</span>
          <span class="label">&euro; {formatPrice(product.price)}</span>
        </button>
      </div>

      <div class="flex flex-col gap-xs pt-lg" data-anim="hero" data-delay="0.5">
        {#each SHARED_DETAILS as [label, value]}
          <div class="flex justify-between text-sm border-b border-rule py-xs">
            <span class="label muted">{label}</span>
            <span class="fw-normal text-soft">{value}</span>
          </div>
        {/each}
      </div>
    </div>
  </div>
</section>

{#if related.length}
  <section class="wrap pb-4xl">
    <div class="flex items-center justify-between pb-md">
      <span class="label muted">You may also like</span>
      <a href="/collection" class="label muted muted-link">All pieces →</a>
    </div>
    <div class="rule"></div>
    <div class="product-grid">
      {#each related as p}
        <ProductCard {...p} />
      {/each}
    </div>
  </section>
{/if}
