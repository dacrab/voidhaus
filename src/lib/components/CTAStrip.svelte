<script lang="ts">
  interface Props {
    label: string;
    linkText: string;
    href: string;
  }
  let { label, linkText, href }: Props = $props();
</script>

<div class="cta wrap" data-anim="scroll">
  <div class="rule"></div>
  <div class="cta-inner">
    <span class="label op-35">{label}</span>
    <a {href} class="label muted-link">{linkText} →</a>
  </div>
  <div class="rule"></div>
</div>