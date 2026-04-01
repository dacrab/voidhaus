<script lang="ts">
  import { fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { SITE } from '../data/site';
  import { trapFocus } from '../lib/focusTrap';

  let open = $state(false);

  const panelIn = () => ({
    duration: 340, easing: cubicOut,
    css: (t: number) => `opacity:${t};transform:translateY(${(1 - t) * 0.5}rem) scale(${0.99 + t * 0.01})`,
  });
</script>

<!-- Strip -->
<button
  class="strip label"
  onclick={() => open = true}
  aria-haspopup="dialog"
  aria-expanded={open}
>
  <span class="dot" aria-hidden="true"></span>
  Available for your brand
  <span class="strip-cta">Enquire →</span>
</button>

<!-- Modal -->
{#if open}
  <div
    class="backdrop"
    style="--backdrop-z:600; background:rgb(28 27 25 / 0.5)"
    role="presentation"
    onclick={() => open = false}
    transition:fade={{ duration: 220 }}
  ></div>

  <div
    class="panel"
    role="dialog"
    aria-modal="true"
    aria-labelledby="fs-title"
    tabindex="-1"
    onkeydown={e => {
      if (e.key === 'Escape') { e.preventDefault(); open = false; return; }
      trapFocus(e.currentTarget as HTMLElement, e);
    }}
    in:panelIn
    out:fade={{ duration: 180 }}
  >
    <div class="panel-head">
      <span class="label muted" id="fs-title">Available</span>
      <button class="ghost-btn close-btn" onclick={() => open = false} aria-label="Close">✕</button>
    </div>

    <div class="rule"></div>

    <div class="panel-body">
      <p class="serif panel-title">This site is available<br/>for your brand.</p>

      <p class="panel-desc muted">
        A complete luxury digital presence — bespoke design, refined interactions,
        fully production-ready. Delivered in days, not months.
      </p>

      <ul class="features label">
        <li>Custom branding & colour system</li>
        <li>Full product catalogue</li>
        <li>Lookbook & editorial pages</li>
        <li>Cart & checkout integration</li>
        <li>Worldwide deployment</li>
      </ul>
    </div>

    <div class="rule"></div>

    <div class="panel-foot">
      <a href={`mailto:${SITE.email.enquiry}`} class="enquire-btn label">
        Get in touch
      </a>
      <span class="label muted">{SITE.email.enquiry}</span>
    </div>
  </div>
{/if}

<style>
  /* ── Strip ───────────────────────────────────────────────────────────── */
  .strip {
    position: fixed; inset-inline: 0; bottom: 0; z-index: 500;
    display: flex; align-items: center; justify-content: center; gap: 1rem;
    padding: 0.75rem 1.5rem;
    background: var(--color-ink); color: var(--color-white);
    border: none; cursor: pointer;
    transition: background 0.2s;
  }
  .strip:hover { background: var(--color-ink-soft); }

  .dot {
    width: 0.4rem; height: 0.4rem;
    background: #6ee7a0; border-radius: 50%;
    animation: pulse 2.4s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.35; }
  }

  .strip-cta { opacity: 0.5; margin-inline-start: 0.25rem; }
  .strip:hover .strip-cta { opacity: 1; }

  /* ── Panel ───────────────────────────────────────────────────────────── */
  .panel {
    position: fixed;
    inset-block: auto 0; inset-inline: 0;
    z-index: 601;
    background: var(--color-white);
    max-width: 28rem;
    margin-inline: auto;
    border-radius: 0.75rem 0.75rem 0 0;
    display: flex; flex-direction: column;
  }

  .panel-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.25rem 1.5rem 1rem;
  }

  .close-btn {
    font-size: 0.75rem; opacity: 0.4;
    padding: 0.25rem; line-height: 1;
  }

  .panel-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }

  .panel-title {
    font-size: clamp(1.5rem, 4vw, 2rem);
    font-style: italic;
    line-height: 1.2;
    color: var(--color-ink);
  }

  .panel-desc { font-size: 0.875rem; line-height: 1.65; }

  .features {
    list-style: none;
    display: flex; flex-direction: column; gap: 0.6rem;
    opacity: 0.55;
  }
  .features li::before { content: '—'; margin-inline-end: 0.5rem; }

  .panel-foot {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1rem 1.5rem 1.25rem; gap: 1rem;
  }

  .enquire-btn {
    display: inline-block;
    padding: 0.65rem 1.5rem;
    background: var(--color-ink); color: var(--color-white);
    text-decoration: none;
    transition: background 0.2s;
    letter-spacing: 0.18em;
  }
  .enquire-btn:hover { background: var(--color-ink-soft); }

  /* ── Responsive ──────────────────────────────────────────────────────── */
  @media (min-width: 640px) {
    .panel {
      inset-block: auto 1rem;
      inset-inline: auto 1.5rem;
      border-radius: 0.75rem;
      margin-inline: 0;
    }
    .strip { justify-content: start; padding-inline: 2rem; }
  }
</style>
