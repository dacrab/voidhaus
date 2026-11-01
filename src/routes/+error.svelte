<script lang="ts">
  import { page } from "$app/state";
  import type { ErrorProps } from "./$types";

  let { error }: ErrorProps = $props();

  const status = $derived(page.status);
  const title = $derived(status === 404 ? "Not Found" : "Error");
</script>

<svelte:head>
  <title>{title} — VOIDHAUS</title>
</svelte:head>

<div class="wrap relative flex items-center overflow-hidden min-h-[calc(100svh-5rem)]">
  <div class="relative z-10 flex flex-col gap-2xl py-32 pb-20">
    <span class="label muted">{status}</span>
    <h1 class="nf-title fw-light leading-[0.88] tracking-[-0.05em] uppercase">
      {status === 404 ? "Page" : "Something"}<br />
      <span class="nf-em">{status === 404 ? "not found." : "unexpected."}</span>
    </h1>
    <p class="text-base fw-normal leading-[1.85] text-soft max-w-[32ch]">
      {#if status === 404}
        This page doesn't exist — or has been removed.<br />The index remains.
      {:else}
        {error.message || "Something went wrong."}<br />Please try again.
      {/if}
    </p>
    <div class="flex gap-12 items-center pt-lg border-t border-rule">
      <a href="/" class="label muted-link">← Home</a>
      <a href="/collection" class="label muted-link">The Index →</a>
    </div>
  </div>
  <span
    class="nf-bg fw-light absolute right-[-0.05em] bottom-[-0.15em] text-transparent pointer-events-none select-none leading-none tracking-[-0.06em]"
    aria-hidden="true">{status}</span
  >
</div>

<style>
  .nf-title { font-size: clamp(3.5rem, 10vw, 8rem); }
  .nf-em { color: var(--color-ink-soft); }
  .nf-bg { font-size: clamp(12rem, 35vw, 32rem); -webkit-text-stroke: 1px var(--color-rule); }
</style>
