<script lang="ts">
  import PageHeader from "$lib/components/PageHeader.svelte";
  import { formatPrice as fmtPrice } from "$lib/utils/cart";

  type OrderRow = {
    id: string;
    items: Array<{ name: string; size: string; price: number; quantity: number }>;
    total: number;
    currency: string;
    status: string;
    createdAt: number;
  };

  let email = $state("");
  let orders: OrderRow[] | null = $state(null);
  let error = $state("");
  let loading = $state(false);

  async function lookup() {
    if (!email) return;
    error = "";
    orders = null;
    loading = true;
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        error = body.error ?? "Something went wrong";
        return;
      }
      const body = (await res.json()) as { orders: OrderRow[] };
      orders = body.orders;
    } catch {
      error = "Could not reach the server";
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>My Orders — VOIDHAUS</title>
</svelte:head>

<PageHeader label="Account" title="My Orders" aside="" />

<div class="wrap py-2xl">
  <form
    role="search"
    aria-label="Look up your orders"
    onsubmit={(e) => { e.preventDefault(); lookup(); }}
  >
    <label for="order-email" class="label muted block mb-sm">
      Enter the email you used at checkout
    </label>
    <div class="flex gap-sm items-start">
      <input
        id="order-email"
        type="email"
        autocomplete="email"
        bind:value={email}
        class="order-input"
        placeholder="you@example.com"
      />
      <button type="submit" class="btn-outline label" disabled={loading}>
        {loading ? "Searching…" : "Search"}
      </button>
    </div>
  </form>

  {#if error}
    <p class="label muted mt-lg" role="alert">{error}</p>
  {/if}

  {#if orders !== null}
    {#if orders.length === 0}
      <p class="label muted mt-lg">No orders found for that email.</p>
    {:else}
      <div class="flex flex-col gap-lg mt-lg">
        {#each orders as order}
          <div class="order-card">
            <div class="flex justify-between items-center mb-sm">
              <span class="label">{new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
              <span class="label" class:status-paid={order.status === "paid"}>{order.status}</span>
            </div>
            <div class="flex flex-col gap-xs mb-sm">
              {#each order.items as item}
                <div class="flex justify-between text-sm">
                  <span>{item.name} <span class="muted">({item.size})</span> &times;{item.quantity}</span>
                  <span class="muted">&euro;{fmtPrice(item.price)}</span>
                </div>
              {/each}
            </div>
            <div class="rule"></div>
            <div class="flex justify-between pt-xs">
              <span class="label">Total</span>
              <span class="label">&euro;{fmtPrice(order.total)}</span>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>

<style>
  .order-input {
    background: var(--color-off);
    border: 1px solid var(--color-rule);
    color: var(--color-ink);
    padding: 0.75rem 1rem;
    font: inherit;
    font-size: 0.875rem;
    width: 100%;
    max-width: 28rem;
    outline: none;
    transition: border-color var(--duration-fast);
  }
  .order-input:focus {
    border-color: var(--color-mid);
  }
  .order-card {
    border: 1px solid var(--color-rule);
    padding: var(--spacing-lg);
    max-width: 36rem;
  }
  .status-paid {
    color: var(--color-ink);
  }
</style>
