<script lang="ts">
  import { formatPrice } from "#lib/format.js";
  import type { Product } from "#lib/data/products.js";
  import { productImage } from "#lib/images.js";

  interface Props {
    product: Product;
  }

  let { product }: Props = $props();

  const image = $derived(productImage(product.img));
  const altImage = $derived(product.img2 ? productImage(product.img2) : undefined);
</script>

<article class="pc">
  <a class="pc-link" href="/product/{product.slug}" aria-label="{product.name} — € {formatPrice(product.price)}">
    <div class="pc-media media-mono">
      <img
        class="pc-img pc-primary"
        src={image.src}
        srcset={image.srcset}
        sizes="(min-width: 900px) 50vw, 100vw"
        alt={product.name}
        loading="lazy"
        decoding="async"
      />
      {#if altImage}
        <img
          class="pc-img pc-alt"
          src={altImage.src}
          srcset={altImage.srcset}
          sizes="(min-width: 900px) 50vw, 100vw"
          alt=""
          loading="lazy"
          decoding="async"
          aria-hidden="true"
        />
      {/if}
      <span class="pc-code label">{product.num}</span>
      <span class="pc-season label">SS26</span>
      <span class="pc-open label" aria-hidden="true">Open <span class="pc-arrow">↗</span></span>
    </div>
    <div class="pc-meta">
      <div class="pc-id">
        <span class="pc-name">{product.name}</span>
        <span class="label pc-cat">{product.category}</span>
      </div>
      <span class="label pc-price">€ {formatPrice(product.price)}</span>
    </div>
  </a>
</article>

<style>
  .pc { position: relative; height: 100%; }

  .pc-link { display: flex; flex-direction: column; height: 100%; }

  .pc-media {
    position: relative;
    overflow: hidden;
    aspect-ratio: 3 / 4;
    background: var(--color-surface);
  }

  .pc-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
  }

  .pc-primary {
    transition:
      opacity var(--duration-slow) var(--ease-img),
      transform var(--duration-slow) var(--ease-out),
      filter var(--duration-slow) var(--ease-img);
  }
  .pc-alt {
    opacity: 0;
    transition:
      opacity var(--duration-slow) var(--ease-img),
      filter var(--duration-slow) var(--ease-img);
  }

  .pc-code,
  .pc-season,
  .pc-open {
    position: absolute;
    z-index: 1;
    color: var(--ot-primary);
    text-shadow: 0 1px 12px rgb(0 0 0 / 0.55);
    pointer-events: none;
  }
  .pc-code { top: 0.9rem; left: 0.9rem; }
  .pc-season { top: 0.9rem; right: 0.9rem; color: var(--ot-secondary); }
  .pc-open {
    bottom: 0.9rem;
    right: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.45rem;
    opacity: 0;
    transform: translateY(6px);
    transition:
      opacity var(--duration-base) var(--ease-out),
      transform var(--duration-base) var(--ease-out);
  }
  .pc-arrow { font-size: 0.85rem; line-height: 1; }

  .pc-meta {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--spacing-md);
    padding: 0.9rem 1rem 1.25rem;
    border-top: 1px solid var(--color-rule);
    margin-top: auto;
  }
  @media (min-width: 768px) {
    .pc-meta { padding: 1rem 1.15rem 1.5rem; }
  }

  .pc-id { display: flex; flex-direction: column; gap: 0.35rem; min-width: 0; }
  .pc-name {
    color: var(--color-ink);
    font-size: var(--text-sm);
    font-variation-settings: var(--fw-normal);
    line-height: 1.3;
    transition: color var(--duration-fast) var(--ease-out);
  }
  .pc-cat { color: var(--color-mid); }
  .pc-price { flex-shrink: 0; color: var(--color-soft); white-space: nowrap; }

  @media (hover: hover) {
    .pc-link:hover .pc-alt { opacity: 1; }
    .pc-link:hover .pc-primary { transform: scale(1.025); }
    .pc-link:hover .pc-open { opacity: 1; transform: translateY(0); }
    .pc-link:hover .pc-name { color: var(--color-ink-soft); }
  }

  @media (max-width: 899px) {
    :global(.index-grid) > :first-child .pc-media { aspect-ratio: 4 / 3; }
    :global(.index-grid) > :last-child:nth-child(even) .pc-media { aspect-ratio: 4 / 3; }
  }

  @media (min-width: 900px) {
    :global(.index-grid) .pc-media { aspect-ratio: auto; height: clamp(22rem, 40vw, 38rem); }
    :global(.home-index) .pc-media { aspect-ratio: auto; height: clamp(24rem, 46vw, 46rem); }
  }
</style>
