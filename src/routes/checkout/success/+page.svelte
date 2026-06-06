<script lang="ts">
  import { SITE } from '$lib/data/site';
</script>

<svelte:head>
  <title>Order Confirmed — VOIDHAUS</title>
</svelte:head>

<div class="wrap flex flex-col items-center justify-center text-center py-5xl">
  <span class="label muted" data-anim="hero">Order confirmed</span>
  <h1 class="serif text-3xl md:text-4xl fw-light leading-[1.1] py-md" data-anim="hero" data-delay="0.1">Thank you</h1>
  <p class="text-[var(--color-soft)] leading-[1.85] max-w-[48ch]" data-anim="hero" data-delay="0.2">
    Your selection is on its way. A confirmation has been sent to your email.
    We appreciate your trust in {SITE.name}.
  </p>
  <div class="flex flex-col sm:flex-row gap-md pt-xl" data-anim="hero" data-delay="0.3">
    <a href="/collection" class="btn-outline" style="justify-content:center">
      <span class="label">Continue Browsing</span>
    </a>
    <a href="/" class="label muted muted-link self-center" style="padding:0.875rem">Return Home</a>
  </div>
</div>