<script lang="ts">
  import { onMount } from 'svelte';
  import { SITE } from '$lib/data/site';
  import { saveCart } from '$lib/utils/cart';

  onMount(() => {
    // Paid: this is the success redirect carrying {CHECKOUT_SESSION_ID}, so the cart
    // can finally be cleared here (it was deliberately kept through the Stripe redirect).
    const sessionId = new URL(window.location.href).searchParams.get('session_id');
    if (sessionId) saveCart([]);
  });
</script>

<svelte:head>
  <title>Order Confirmed — VOIDHAUS</title>
</svelte:head>

<div class="wrap flex flex-col items-center justify-center text-center py-5xl">
  <span class="label muted" data-anim="hero">Order confirmed</span>
  <h1 class="serif text-3xl md:text-4xl fw-light leading-[1.1] py-md" data-anim="hero" data-delay="0.1">Thank you</h1>
  <p class="text-soft leading-[1.85] max-w-[48ch]" data-anim="hero" data-delay="0.2">
    Your selection is on its way. We appreciate your trust in {SITE.name}.
  </p>
  <div class="flex flex-col sm:flex-row gap-md pt-xl" data-anim="hero" data-delay="0.3">
    <a href="/collection" class="btn-outline justify-center">
      <span class="label">Continue Browsing</span>
    </a>
    <a href="/" class="label muted muted-link self-center py-sm px-md">Return Home</a>
  </div>
</div>