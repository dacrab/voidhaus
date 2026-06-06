<script lang="ts">
  import PageHeader from '$lib/components/PageHeader.svelte';
  let { data } = $props();
  const regions = $derived(data.stockists);
</script>

<svelte:head>
  <title>Stockists — VOIDHAUS</title>
</svelte:head>

<PageHeader label="Retail" title="Stockists" />

<div class="wrap">
  <div class="rule"></div>
  <div class="py-2xl md:py-3xl flex flex-col gap-3xl">
    {#each regions as region}
      <section data-anim="scroll">
        <span class="label muted">{region.region}</span>
        <div class="flex flex-col pt-lg">
          {#each region.stores as store}
            <div class="flex flex-col gap-xs py-md border-b border-[var(--color-rule)]">
              <div class="flex items-baseline justify-between gap-md">
                <span class="fw-medium">{store.name}</span>
                <span class="label muted">{store.city}</span>
              </div>
              <span class="text-sm text-[var(--color-soft)]">{store.address}, {store.country}</span>
            </div>
          {/each}
        </div>
      </section>
    {/each}
  </div>
</div>