<script lang="ts">
  import { IMAGES } from '$lib/data/images';
  import { formatPrice } from '$lib/utils/cart';

  interface Props {
    slug: string;
    num: string;
    name: string;
    price: number;
    img: string;
    img2?: string;
    category?: string;
  }

  let { slug, num, name, price, img, img2, category }: Props = $props();
</script>

<article class="pc" data-category={category}>
  <a class="block" href="/product/{slug}" aria-label="{name} — € {formatPrice(price)}">
    <div class="pc-media relative aspect-[3/4] overflow-hidden bg-off">
      <img
        class="pc-img pc-primary"
        src={IMAGES[img]}
        alt={name}
        loading="lazy"
        decoding="async"
      />
      {#if img2 && IMAGES[img2]}
        <img
          class="pc-img pc-alt absolute inset-0 opacity-0 pointer-events-none"
          src={IMAGES[img2]}
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
        <span class="label muted">{num}</span>
        <span class="card-name">{name}</span>
        {#if category}
          <span class="label muted">{category}</span>
        {/if}
      </div>
      <span class="label muted card-price">€ {formatPrice(price)}</span>
    </div>
  </a>
</article>

<style>
  .pc {
    transition: opacity 0.5s ease, transform 0.5s ease;
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
