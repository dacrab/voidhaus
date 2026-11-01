<script lang="ts">
  import { onMount } from "svelte";
  import { SITE } from "#lib/data/site.js";
  import { cart } from "#lib/stores/cart.svelte.js";
  import { OrdersResponseSchema } from "#lib/utils/schemas.js";

  let state = $state<"verifying" | "confirmed" | "processing">("verifying");

  onMount(async () => {
    const sessionId = new URL(window.location.href).searchParams.get("session_id");
    if (!sessionId) {
      state = "processing";
      return;
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (!response.ok) {
        state = "processing";
        return;
      }

      const parsed = OrdersResponseSchema.safeParse(await response.json());
      if (!parsed.success) {
        state = "processing";
        return;
      }

      if (parsed.data.orders.some((order) => order.status === "paid")) {
        cart.clear();
        state = "confirmed";
      } else {
        state = "processing";
      }
    } catch {
      state = "processing";
    }
  });
</script>

<svelte:head>
  <title>Order Confirmed — VOIDHAUS</title>
</svelte:head>

<div class="wrap flex flex-col items-center justify-center text-center py-5xl">
  {#if state === "verifying"}
    <span class="label muted">Checking your order…</span>
  {:else}
    <span class="label muted">{state === "confirmed" ? "Order confirmed" : "Processing payment"}</span>
    <h1 class="serif text-3xl md:text-4xl fw-light leading-[1.1] py-md">
      {state === "confirmed" ? "Thank you" : "Almost there"}
    </h1>
    <p class="text-soft leading-[1.85] max-w-[48ch]">
      {#if state === "confirmed"}
        Your selection is on its way. We appreciate your trust in {SITE.name}.
      {:else}
        Your payment is being processed or could not be verified yet. You will receive a confirmation email as soon as
        it completes.
      {/if}
    </p>
    <div class="flex flex-col sm:flex-row gap-md pt-xl">
      <a href="/collection" class="btn-outline justify-center">
        <span class="label">Continue Browsing</span>
      </a>
      <a href="/" class="label muted muted-link self-center py-sm px-md">Return Home</a>
    </div>
  {/if}
</div>
