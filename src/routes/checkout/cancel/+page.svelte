<script lang="ts">
  import { SITE } from "#lib/data/site.js";
</script>

<svelte:head>
  <title>Payment Cancelled — VOIDHAUS</title>
</svelte:head>

<div class="wrap flex min-h-[calc(100svh-14rem)] flex-col items-center justify-center text-center py-5xl">
  <span class="label muted" data-anim="hero">Payment cancelled</span>
  <h1 class="display text-3xl md:text-5xl fw-light py-md" data-anim="hero" data-delay="0.08">
    No charge made
  </h1>
  <p class="text-soft leading-[1.85] max-w-[48ch]" data-anim="hero" data-delay="0.16">
    Your checkout was cancelled and your card was not charged. Your selection is still held at {SITE.name}.
  </p>
  <div class="flex flex-col sm:flex-row items-center justify-center gap-md pt-xl" data-anim="hero" data-delay="0.24">
    <a href="/collection" class="btn-outline justify-center w-full sm:w-auto px-xl">
      <span class="label">Return to the index</span>
    </a>
    <a href="/" class="label muted muted-link self-center py-sm px-md whitespace-nowrap">Home</a>
  </div>
</div>
