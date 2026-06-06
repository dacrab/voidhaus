<script lang="ts">
  import { IMAGES } from '$lib/data/images';

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
  <a class="block" href="/product/{slug}" aria-label="{name} — € {price.toLocaleString('en-US')}">
    <div class="pc-media relative aspect-[3/4] overflow-hidden bg-[var(--color-off)]">
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
    </div>
    <div class="card-info">
      <div class="card-info-l">
        <span class="label muted">{num}</span>
        <span class="card-name">{name}</span>
        {#if category}
          <span class="label muted">{category}</span>
        {/if}
      </div>
      <span class="label muted card-price">€ {price.toLocaleString('en-US')}</span>
    </div>
  </a>
</article>

<style>
  .pc {
    transition: opacity 0.5s ease, transform 0.5s ease;
    will-change: opacity, transform;
  }
  .pc-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
    transition: opacity 0.8s ease;
  }
  @media (hover: hover) {
    .pc a:hover .pc-media { box-shadow: 0 0 0 1px var(--color-ink); }
    .pc a:hover .pc-alt { opacity: 1; transition: opacity 1.2s var(--ease-img); }
  }
</style>