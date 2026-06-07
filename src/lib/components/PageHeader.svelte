<script lang="ts">
  interface Props {
    label: string;
    title: string;
    aside?: string;
  }
  let { label, title, aside }: Props = $props();
</script>

<div class="ph wrap page-header">
  <div class="ph-inner">
    <div class="ph-left">
      <span class="label muted" data-anim="hero">{label}</span>
      <h1 class="ph-title fw-light" data-anim="hero" data-delay="0.1">{title}</h1>
    </div>
    {#if aside}
      <span class="label muted self-end pb-1" data-anim="hero" data-delay="0.2">{aside}</span>
    {/if}
  </div>
  <div class="rule js-rule"></div>
</div>
