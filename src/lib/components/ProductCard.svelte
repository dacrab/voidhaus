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
  <a class="block" href="/product/{product.slug}" aria-label="{product.name} — € {formatPrice(product.price)}">
    <div class="pc-media relative aspect-[3/4] overflow-hidden bg-surface">
      <img
        class="pc-img pc-primary"
        src={image.src}
        srcset={image.srcset}
        sizes="(min-width: 1024px) 33vw, 50vw"
        alt={product.name}
        loading="lazy"
        decoding="async"
      />
      {#if altImage}
        <img
          class="pc-img pc-alt absolute inset-0 opacity-0 pointer-events-none"
          src={altImage.src}
          srcset={altImage.srcset}
          sizes="(min-width: 1024px) 33vw, 50vw"
          alt=""
          loading="lazy"
          decoding="async"
          aria-hidden="true"
        />
      {/if}
      <div class="pc-indicator">
        <span class="pc-indicator-line"></span>
        <span class="pc-indicator-label label">View</span>
      </div>
    </div>
    <div class="card-info">
      <div class="card-info-l">
        <span class="label muted">{product.num}</span>
        <span class="card-name">{product.name}</span>
        <span class="label muted">{product.category}</span>
      </div>
      <span class="label muted card-price">€ {formatPrice(product.price)}</span>
    </div>
  </a>
</article>

<style>
  .pc {
    position: relative;
  }
  .pc-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
    transition: opacity 0.8s ease, transform 1.2s var(--ease-out);
  }
  .pc-indicator {
    position: absolute; bottom: var(--spacing-md); right: var(--spacing-md);
    display: flex; align-items: center; gap: var(--spacing-sm);
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.4s var(--ease-out), transform 0.4s var(--ease-out);
  }
  .pc-indicator-line {
    width: 1.5rem; height: 1px; background: var(--ot-primary);
  }
  .pc-indicator-label {
    color: var(--ot-primary);
    font-size: 0.625rem;
  }
  @media (hover: hover) {
    .pc a:hover .pc-media { box-shadow: 0 0 0 1px var(--color-ink); }
    .pc a:hover .pc-alt {
      opacity: 1;
      transition: opacity 1.2s var(--ease-img);
    }
    .pc a:hover .pc-primary { transform: scale(1.03); }
    .pc a:hover .pc-indicator {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
