<script lang="ts">
  import { SITE } from '$lib/data/site';
</script>

<svelte:head>
  <title>Payment Cancelled — VOIDHAUS</title>
</svelte:head>

<div class="wrap flex flex-col items-center justify-center text-center py-5xl">
  <span class="label muted" data-anim="hero">Payment cancelled</span>
  <h1 class="serif text-3xl md:text-4xl fw-light leading-[1.1] py-md" data-anim="hero" data-delay="0.1">No charge made</h1>
  <p class="text-soft leading-[1.85] max-w-[48ch]" data-anim="hero" data-delay="0.2">
    Your checkout was cancelled and your card was not charged. Your selection is still
    waiting for you at {SITE.name}.
  </p>
  <div class="flex flex-col sm:flex-row gap-md pt-xl" data-anim="hero" data-delay="0.3">
    <a href="/collection" class="btn-outline justify-center">
      <span class="label">Continue Browsing</span>
    </a>
    <a href="/" class="label muted muted-link self-center py-sm px-md">Return Home</a>
  </div>
</div>
