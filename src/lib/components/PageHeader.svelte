<script lang="ts">
  interface Props {
    label: string;
    title: string;
    aside?: string;
  }
  let { label, title, aside }: Props = $props();
</script>

<div class="page-header wrap">
  <div class="ph-inner">
    <div class="ph-left">
      <span class="label muted" data-anim="hero">{label}</span>
      <h1 class="ph-title fw-light" data-anim="hero" data-delay="0.08">{title}</h1>
    </div>
    {#if aside}
      <span class="label muted self-end pb-1" data-anim="hero" data-delay="0.16">{aside}</span>
    {/if}
  </div>
  <div class="rule" data-anim="rule" data-delay="0.14"></div>
</div>
