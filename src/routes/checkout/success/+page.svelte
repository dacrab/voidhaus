<script lang="ts">
  import { onMount } from "svelte";
  import { cart } from "#lib/stores/cart.svelte.js";
  import { OrdersResponseSchema } from "#lib/utils/schemas.js";

  let orderState = $state<"verifying" | "confirmed" | "processing">("verifying");
  let sessionId = $state("");

  const confirmed = $derived(orderState === "confirmed");
  const verifying = $derived(orderState === "verifying");
  const ordersHref = $derived(sessionId ? `/orders?session_id=${encodeURIComponent(sessionId)}` : "/orders");

  onMount(async () => {
    sessionId = new URL(window.location.href).searchParams.get("session_id") ?? "";
    if (!sessionId) {
      orderState = "processing";
      return;
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (!response.ok) {
        orderState = "processing";
        return;
      }

      const parsed = OrdersResponseSchema.safeParse(await response.json());
      if (!parsed.success) {
        orderState = "processing";
        return;
      }

      if (parsed.data.orders.some((order) => order.status === "paid")) {
        cart.clear();
        orderState = "confirmed";
      } else {
        orderState = "processing";
      }
    } catch {
      orderState = "processing";
    }
  });
</script>

<svelte:head>
  <title>{confirmed ? "Order Confirmed" : "Order Status"} — VOIDHAUS</title>
</svelte:head>

<div
  class="wrap flex min-h-[calc(100svh-14rem)] flex-col items-center justify-center text-center py-5xl"
  aria-live="polite"
>
  <span class="label muted" data-anim="hero">
    {verifying ? "Checking your order…" : confirmed ? "Order confirmed" : "Processing payment"}
  </span>
  <h1 class="serif text-3xl md:text-4xl fw-light leading-[1.1] py-md" data-anim="hero" data-delay="0.1">
    {verifying ? "One moment" : confirmed ? "Thank you" : "Almost there"}
  </h1>
  <p class="text-soft leading-[1.85] max-w-[48ch]" data-anim="hero" data-delay="0.2">
    {#if verifying}
      Please wait while we verify your payment.
    {:else if confirmed}
      Your order is confirmed and your selection is on its way. Keep the order reference from your payment redirect to
      look it up under My Orders.
    {:else}
      Your payment is still processing. Refresh this page in a moment, or look it up under My Orders.
    {/if}
  </p>
  <div class="flex flex-col sm:flex-row items-center justify-center gap-md pt-xl" data-anim="hero" data-delay="0.3">
    <a href="/collection" class="btn-outline justify-center w-full sm:w-auto px-xl">
      <span class="label">Continue Browsing</span>
    </a>
    <a href={ordersHref} class="label muted muted-link self-center py-sm px-md whitespace-nowrap">My Orders →</a>
  </div>
  <p class="text-sm text-soft pt-xl" data-anim="hero" data-delay="0.4">
    Questions? <a href="/contact" class="muted-link">Contact us</a>.
  </p>
</div>
