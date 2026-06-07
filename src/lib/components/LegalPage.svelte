<script lang="ts">
  import PageHeader from '$lib/components/PageHeader.svelte';

  interface Props {
    title: string;
    description: string;
    updated: string;
    sibling: { href: string; label: string };
    sections: { title: string; body: string }[];
  }
  let { title, description, updated, sibling, sections }: Props = $props();
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
</svelte:head>

<PageHeader label={updated} {title} />

<div class="wrap pb-4xl">
  <div class="grid pt-2xl md:grid-cols-[200px_1fr] md:gap-4xl md:items-start">
    <nav class="flex flex-col gap-sm pb-2xl max-md:flex-row md:sticky md:top-[calc(var(--nav-h)+2rem)]" aria-label="Legal navigation">
      <a href={sibling.href} class="label muted muted-link">{sibling.label} →</a>
    </nav>

    <div>
      {#each sections as s, i}
        <div
          class="flex flex-col gap-sm py-8 border-b border-rule md:py-10 {i === 0 ? 'border-t border-rule md:border-t-0' : ''}"
          data-anim="scroll"
        >
          <h2 class="label text-ink">{s.title}</h2>
          <p class="text-base fw-normal leading-[1.85] text-soft max-w-[60ch]">{s.body}</p>
        </div>
      {/each}
    </div>
  </div>
</div>