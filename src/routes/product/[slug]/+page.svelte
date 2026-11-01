<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import ProductCard from "#lib/components/ProductCard.svelte";
  import SizeGuide from "#lib/components/SizeGuide.svelte";
  import { APPAREL_CATEGORIES, PRODUCT_DETAILS, PRODUCTS } from "#lib/data/products.js";
  import { SITE } from "#lib/data/site.js";
  import { formatPrice } from "#lib/format.js";
  import { productImage } from "#lib/images.js";
  import { SITE_URL } from "#lib/site-url.js";
  import { cart } from "#lib/stores/cart.svelte.js";
  import { StockResponseSchema } from "#lib/utils/schemas.js";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const product = $derived(data.product);
  const image = $derived(productImage(product.img));
  const detailImage = $derived(product.img2 ? productImage(product.img2) : undefined);
  const socialImage = $derived(new URL(image.src, SITE_URL).href);
  const isApparel = $derived(APPAREL_CATEGORIES.includes(product.category));
  const sized = $derived(isApparel && product.sizes.length > 1);
  const specs = $derived(product.details ?? PRODUCT_DETAILS);
  const note = $derived(
    sized
      ? "Cut generously. If between sizes, size down."
      : product.category === "Objects"
        ? "Edition of twelve. Ships flat."
        : "One size. Ships flat.",
  );
  const related = $derived([
    ...PRODUCTS.filter((item) => item.category === product.category && item.slug !== product.slug),
    ...PRODUCTS.filter((item) => item.category !== product.category),
  ].slice(0, 3));

  let selectedSize = $state("");
  let showColour = $state(false);
  let added = $state(false);
  let stock = $state<Record<string, number> | null>(null);
  let resetTimer: ReturnType<typeof setTimeout> | undefined;

  const allSoldOut = $derived(Boolean(stock) && product.sizes.every((size) => stock?.[size] === 0));

  onDestroy(() => clearTimeout(resetTimer));

  onMount(() => {
    const controller = new AbortController();

    if (product.sizes.length === 1) selectedSize = product.sizes[0] ?? "";

    void (async () => {
      try {
        const response = await fetch(`/api/stock?slug=${encodeURIComponent(product.slug)}`, {
          signal: controller.signal,
        });
        if (!response.ok) return;

        const parsed = StockResponseSchema.safeParse(await response.json());
        if (!parsed.success) return;

        stock = parsed.data.stock;
        if (selectedSize && stock[selectedSize] === 0) selectedSize = "";
      } catch {
        // Live availability is an enhancement; checkout re-validates stock.
      }
    })();

    return () => controller.abort();
  });

  function isSoldOut(size: string): boolean {
    return stock?.[size] === 0;
  }

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

<header class="pdp-head wrap">
  <div class="pdp-head-top" data-anim="hero">
    <a href="/collection" class="label muted-link">← The Index</a>
    <span class="label">{product.num} / {product.category}</span>
  </div>
  <div class="pdp-title-row" data-anim="hero" data-delay="0.1">
    <h1 class="pdp-title">{product.name}</h1>
    <span class="pdp-ghost" aria-hidden="true">{product.num}</span>
  </div>
</header>

<section class="wrap pdp-body">
  <div class="pdp-gallery">
    <figure class="pdp-figure media-mono" class:is-colour={showColour}>
      <img
        class="pdp-main"
        src={image.src}
        srcset={image.srcset}
        sizes="(min-width: 900px) 58vw, 100vw"
        alt={product.name}
        width="900"
        height="1200"
      />
      <button
        class="pdp-colour label"
        type="button"
        onclick={() => (showColour = !showColour)}
        aria-pressed={showColour}
        aria-label={showColour ? "View in monochrome" : "View in colour"}
      >
        <span class="pdp-dot" class:on={showColour} aria-hidden="true"></span>
        {showColour ? "Mono" : "Colour"}
      </button>
    </figure>

    {#if detailImage}
      <figure class="pdp-figure pdp-figure--detail media-mono" class:is-colour={showColour}>
        <img
          src={detailImage.src}
          srcset={detailImage.srcset}
          sizes="(min-width: 900px) 58vw, 100vw"
          alt="{product.name} — second view"
          loading="lazy"
          decoding="async"
          width="900"
          height="1200"
        />
      </figure>
    {/if}

    <p class="pdp-caption label">
      <span>Fig. {product.num}</span>
      <span>{product.name} / {SITE.season}</span>
    </p>
  </div>

  <aside class="pdp-info">
    <div class="pdp-price-row" data-anim="hero" data-delay="0.2">
      <span class="label muted">Price</span>
      <span class="pdp-price">€ {formatPrice(product.price)}</span>
    </div>

    <p class="pdp-desc" data-anim="hero" data-delay="0.25">{product.desc}</p>

    <dl class="specs" data-anim="hero" data-delay="0.3">
      <div>
        <dt class="label muted">Material</dt>
        <dd>{product.material}</dd>
      </div>
      <div>
        <dt class="label muted">Origin</dt>
        <dd>{product.origin}</dd>
      </div>
      {#each specs as [label, value] (label)}
        <div>
          <dt class="label muted">{label}</dt>
          <dd>{value}</dd>
        </div>
      {/each}
    </dl>

    <div class="pdp-buy" data-anim="hero" data-delay="0.35">
      <div class="size-head">
        <span class="label">{sized ? "Size" : "Format"}</span>
        {#if sized}
          <SizeGuide />
        {/if}
      </div>
      <div class="sizes">
        {#each product.sizes as size (size)}
          {@const soldOut = isSoldOut(size)}
          <button
            class="size-btn"
            class:size-btn--active={selectedSize === size}
            class:size-btn--soldout={soldOut}
            type="button"
            onclick={() => (selectedSize = size)}
            aria-pressed={selectedSize === size}
            aria-label={soldOut ? `${size} — sold out` : undefined}
            title={soldOut ? "Sold out" : undefined}
            disabled={soldOut}
          >
            {size}
          </button>
        {/each}
      </div>

      <button class="btn-outline pdp-add" type="button" onclick={addToCart} disabled={!selectedSize || allSoldOut}>
        <span class="label">{allSoldOut ? "Sold out" : added ? "Added ✓" : "Add to Selection"}</span>
        <span class="label">&euro; {formatPrice(product.price)}</span>
      </button>

      <p class="label pdp-note">
        {note}
      </p>
    </div>
  </aside>
</section>

{#if related.length}
  <section class="wrap pdp-related">
    <div class="section-head" data-anim="scroll">
      <span class="label">Continue the index</span>
      <a href="/collection" class="label muted-link">All objects →</a>
    </div>
    <div class="product-grid" data-anim="scroll">
      {#each related as item (item.slug)}
        <ProductCard product={item} />
      {/each}
    </div>
  </section>
{/if}

<style>
  .pdp-head {
    padding-top: var(--page-top-lg);
    padding-bottom: var(--spacing-2xl);
  }
  .pdp-head-top {
    display: flex;
    justify-content: space-between;
    gap: var(--spacing-md);
    padding-bottom: var(--spacing-sm);
    border-bottom: 1px solid var(--color-rule);
  }
  .pdp-title-row {
    position: relative;
    display: flex;
    align-items: flex-end;
    gap: var(--spacing-xl);
    margin-top: clamp(1.5rem, 3vw, 2.5rem);
  }
  .pdp-title {
    font-size: clamp(3rem, 9.5vw, 10rem);
    font-variation-settings: var(--fw-light);
    letter-spacing: -0.065em;
    line-height: 0.82;
    text-transform: uppercase;
    max-width: 14ch;
  }
  .pdp-ghost {
    margin-left: auto;
    font-family: var(--font-mono);
    font-size: clamp(4rem, 12vw, 13rem);
    line-height: 0.7;
    color: transparent;
    -webkit-text-stroke: 1px var(--color-rule);
    pointer-events: none;
    user-select: none;
  }

  .pdp-body {
    display: grid;
    gap: var(--spacing-2xl);
    align-items: start;
    padding-bottom: var(--spacing-3xl);
  }
  .pdp-gallery { display: flex; flex-direction: column; gap: 1px; }
  .pdp-figure {
    position: relative;
    overflow: hidden;
    background: var(--color-surface);
    aspect-ratio: 3 / 4;
  }
  .pdp-figure img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
  }
  .pdp-figure--detail { aspect-ratio: 4 / 5; }

  .pdp-colour {
    position: absolute;
    bottom: 0.9rem;
    left: 0.9rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.7rem;
    border: 1px solid rgb(255 255 255 / 0.35);
    background: rgb(0 0 0 / 0.45);
    color: var(--ot-primary);
    cursor: pointer;
    backdrop-filter: blur(6px);
    transition: background var(--duration-fast), border-color var(--duration-fast);
  }
  .pdp-colour:hover { background: rgb(0 0 0 / 0.7); border-color: var(--ot-primary); }
  .pdp-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: transparent;
    border: 1px solid currentColor;
    transition: background var(--duration-fast);
  }
  .pdp-dot.on { background: currentColor; }

  .pdp-caption {
    display: flex;
    justify-content: space-between;
    gap: var(--spacing-md);
    padding-top: var(--spacing-sm);
    color: var(--color-mid);
  }

  .pdp-info { display: flex; flex-direction: column; gap: var(--spacing-xl); }
  .pdp-price-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--spacing-md);
    padding-bottom: var(--spacing-md);
    border-bottom: 1px solid var(--color-rule);
  }
  .pdp-price {
    font-family: var(--font-mono);
    font-size: clamp(1.25rem, 2vw, 1.75rem);
    color: var(--color-ink);
  }
  .pdp-desc {
    max-width: 44ch;
    color: var(--color-soft);
    font-size: 1.0625rem;
    line-height: 1.75;
  }

  .specs { display: flex; flex-direction: column; }
  .specs > div {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--spacing-lg);
    padding-block: 0.7rem;
    border-bottom: 1px solid var(--color-rule);
  }
  .specs dt { flex-shrink: 0; }
  .specs dd {
    color: var(--color-ink-soft);
    font-size: var(--text-sm);
    text-align: right;
  }

  .pdp-buy { display: flex; flex-direction: column; gap: var(--spacing-md); }
  .size-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-md);
  }
  .size-head > .label { color: var(--color-ink); }
  .sizes { display: flex; flex-wrap: wrap; gap: var(--spacing-xs); }
  .pdp-add { margin-top: var(--spacing-xs); }
  .pdp-note { color: var(--color-mid); }

  .pdp-related { padding-bottom: var(--spacing-3xl); }
  .pdp-related .product-grid { margin-top: var(--spacing-lg); }

  @media (min-width: 900px) {
    .pdp-body { grid-template-columns: minmax(0, 7fr) minmax(20rem, 4fr); gap: clamp(2rem, 5vw, 6rem); }
    .pdp-info { position: sticky; top: calc(var(--nav-h) + 1.5rem); padding-top: 0.25rem; }
  }

  @media (max-width: 600px) {
    .pdp-ghost { display: none; }
    .pdp-title { font-size: clamp(2.75rem, 13vw, 5rem); }
  }
</style>
