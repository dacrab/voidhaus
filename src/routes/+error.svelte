<script lang="ts">
  let { status }: { status?: number } = $props();
  const code = $derived(status ?? 404);
  const title = $derived(code === 404 ? 'Not Found' : 'Error');
  const msg = $derived(
    code === 404
      ? "This page doesn't exist — or has been removed.<br/>The collection remains."
      : 'Something went wrong.<br/>Please try again.'
  );
</script>

<svelte:head>
  <title>{title} — VOIDHAUS</title>
</svelte:head>

<div class="wrap relative flex items-center overflow-hidden min-h-[calc(100svh-5rem)]">
  <div class="relative z-10 flex flex-col gap-2xl py-32 pb-20">
    <span class="label muted">{code}</span>
    <h1 class="nf-title serif fw-medium italic leading-[0.95] tracking-[-0.03em]">{title}<br/><em class="not-italic text-ink-soft">{code === 404 ? 'found.' : 'unexpected.'}</em></h1>
    <p class="text-base fw-normal leading-[1.85] text-soft max-w-[32ch]">{@html msg}</p>
    <div class="flex gap-12 items-center pt-lg border-t border-rule">
      <a href="/" class="label muted-link">← Home</a>
      <a href="/collection" class="label muted-link">Collection →</a>
    </div>
  </div>
  <span class="nf-bg fw-light absolute right-[-0.05em] bottom-[-0.15em] text-transparent pointer-events-none select-none leading-none tracking-[-0.06em]" aria-hidden="true">{code}</span>
</div>

<style>
  .nf-title { font-size: clamp(3.5rem, 10vw, 8rem); }
  .nf-bg { font-size: clamp(12rem, 35vw, 32rem); -webkit-text-stroke: 1px var(--color-rule); }
</style>