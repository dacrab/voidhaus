<script lang="ts">
  import { onDestroy } from "svelte";
  import PageHeader from "#lib/components/PageHeader.svelte";
  import ProductCard from "#lib/components/ProductCard.svelte";
  import SizeGuide from "#lib/components/SizeGuide.svelte";
  import { PRODUCT_DETAILS, PRODUCTS } from "#lib/data/products.js";
  import { SITE } from "#lib/data/site.js";
  import { formatPrice } from "#lib/format.js";
  import { productImage } from "#lib/images.js";
  import { cart } from "#lib/stores/cart.svelte.js";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const product = $derived(data.product);
  const image = $derived(productImage(product.img));
  const detailImage = $derived(product.img2 ? productImage(product.img2) : undefined);
  const socialImage = $derived(new URL(product.img, SITE.url).href);
  const related = $derived(
    PRODUCTS.filter((item) => item.category === product.category && item.slug !== product.slug).slice(0, 3),
  );

  let selectedSize = $state("");
  let added = $state(false);
  let resetTimer: ReturnType<typeof setTimeout> | undefined;

  onDestroy(() => clearTimeout(resetTimer));

  function addToCart() {
    if (!selectedSize) return;

    cart.add({
      slug: product.slug,
      name: product.name,
      price: product.price,
      size: selectedSize,
      img: product.img,
      num: product.num,
    });
    cart.openPanel();

    added = true;
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      added = false;
    }, 2000);
  }
</script>

<svelte:head>
  <title>{product.name} — VOIDHAUS</title>
  <meta property="og:title" content="{product.name} — VOIDHAUS" />
  <meta property="og:image" content={socialImage} />
  <meta name="twitter:image" content={socialImage} />
</svelte:head>

<PageHeader label={product.num} title={product.name} aside={product.category} />

<div class="wrap">
  <div class="rule"></div>
</div>

<section class="wrap py-2xl md:py-3xl">
  <div class="grid gap-2xl md:grid-cols-2 md:gap-4xl">
    <div class="pdp-images">
      <img
        class="pdp-main w-full aspect-[3/4] object-cover object-top bg-surface"
        src={image.src}
        srcset={image.srcset}
        sizes="(min-width: 768px) 50vw, 100vw"
        alt={product.name}
        width="900"
        height="1200"
      />
      {#if detailImage}
        <img
          class="w-full aspect-[3/4] object-cover object-top bg-surface mt-1"
          src={detailImage.src}
          srcset={detailImage.srcset}
          sizes="(min-width: 768px) 50vw, 100vw"
          alt="{product.name} detail"
          loading="lazy"
          decoding="async"
          width="900"
          height="1200"
        />
      {/if}
    </div>

    <div>
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
          <SizeGuide category={product.category === "Footwear" ? "Footwear" : "Clothing"} />
        </div>
        <div class="flex flex-wrap gap-sm">
          {#each product.sizes as size (size)}
            <button
              class="size-btn"
              class:size-btn--active={selectedSize === size}
              type="button"
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
          class="btn-outline"
          class:muted={!selectedSize}
          class:cursor-not-allowed={!selectedSize}
          type="button"
          onclick={addToCart}
          disabled={!selectedSize}
        >
          <span class="label">{added ? "Added ✓" : "Add to Selection"}</span>
          <span class="label">&euro; {formatPrice(product.price)}</span>
        </button>
      </div>

      <div class="flex flex-col gap-xs pt-lg" data-anim="hero" data-delay="0.5">
        {#each PRODUCT_DETAILS as [label, value] (label)}
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
      {#each related as item (item.slug)}
        <ProductCard product={item} />
      {/each}
    </div>
  </section>
{/if}
