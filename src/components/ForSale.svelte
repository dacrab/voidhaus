<script lang="ts">
  import { fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { lockScroll, unlockScroll } from '../lib/scrollLock';

  import { onMount } from 'svelte';

  let open    = $state(false);
  // Start hidden; onMount checks the class set by the inline script before first paint.
  // Because the Layout inline script runs synchronously before any hydration,
  // banner-dismissed is already on <html> when Svelte hydrates — so this is
  // effectively FOUC-free on the client.
  let visible = $state(false);

  onMount(() => {
    // Read the flag set by the Layout inline script — synchronous, no flicker
    visible = !document.documentElement.classList.contains('banner-dismissed');
  });

  function panelTransition(node: Element) {
    return {
      duration: 460,
      easing: cubicOut,
      // GPU-composited properties only
      css: (t: number) => `
        opacity: ${t};
        transform: translateY(${(1 - t) * 1.25}rem);
        will-change: opacity, transform;
      `,
    };
  }

  function dismiss() {
    visible = false;
    document.documentElement.classList.add('banner-dismissed');
    try { sessionStorage.setItem('vh-sale-dismissed', '1'); } catch {}
  }

  function openPanel()  { open = true;  lockScroll();   }
  function closePanel() { open = false; unlockScroll(); }

</script>

<!-- ── Top banner strip ───────────────────────────────────────────────── -->
{#if visible}
  <div class="sale-strip" transition:fade={{ duration: 300 }}>
    <button class="strip-inner" onclick={openPanel} aria-label="This site is for sale — click to learn more">
      <span class="strip-dot" aria-hidden="true"></span>
      <span class="label strip-text">This site is available for purchase</span>
      <span class="label strip-cta">Learn more →</span>
    </button>
    <button class="strip-dismiss label" onclick={dismiss} aria-label="Dismiss">×</button>
  </div>
{/if}

<!-- ── Full info panel ───────────────────────────────────────────────────── -->
{#if open}
  <div
    class="backdrop"
    style="--backdrop-z:600; background:rgb(28 27 25/0.5)"
    role="presentation"
    onclick={closePanel}
    transition:fade={{ duration: 320 }}
  ></div>

  <div
    class="sale-panel"
    role="dialog"
    aria-modal="true"
    aria-label="Site for sale"
    transition:panelTransition
  >
    <div class="panel-header">
      <span class="label panel-tag">Available</span>
      <button
        class="label ghost-btn"
        onclick={closePanel}
        aria-label="Close"
      >Close</button>
    </div>

    <div class="panel-body">
      <h2 class="panel-title serif">This site<br/>is for sale.</h2>

      <div class="panel-divider"></div>

      <div class="panel-details">

        <div class="detail-block">
          <span class="label muted detail-label">What you get</span>
          <ul class="detail-list">
            {#each [
              'Complete, production-ready website — ready to deploy in minutes',
              'Full source code with clean, well-organised file structure',
              '12-piece luxury fashion catalog with editorial photography',
              'Working shopping cart — items persist between visits',
              'Size guide, stockists, privacy & terms pages',
              'Newsletter signup form — ready to connect to any email service',
              'Mobile-friendly across all screen sizes',
              'GitHub repository transfer included',
            ] as item}
              <li class="detail-item">
                <span class="detail-check label" aria-hidden="true">—</span>
                <span>{item}</span>
              </li>
            {/each}
          </ul>
        </div>

        <div class="detail-block">
          <span class="label muted detail-label">Built with</span>
          <div class="stack-grid">
            {#each [
              ['Framework', 'Astro 6 — blazing fast, great for SEO'],
              ['Interactivity', 'Svelte 5 — modern, minimal JavaScript'],
              ['Animations', 'GSAP — smooth, cinematic transitions'],
              ['Typography', 'DM Sans + Cormorant — self-hosted, no Google'],
              ['Deployment', 'Vercel-ready — one click to go live'],
            ] as [k, v]}
              <div class="stack-row">
                <span class="label muted">{k}</span>
                <span class="stack-val">{v}</span>
              </div>
            {/each}
          </div>
        </div>

        <div class="detail-block">
          <span class="label muted detail-label">Design quality</span>
          <p class="detail-note">
            Every page was benchmarked against Rick Owens, Maison Margiela,
            The Row, Lemaire, Jil Sander, and Balenciaga. The typography,
            spacing, interactions, and overall feel are modelled on how
            the world's most respected fashion houses present themselves online.
          </p>
        </div>

      </div>

      <div class="panel-divider"></div>

      <div class="panel-contact">
        <p class="contact-line">Interested? Get in touch:</p>
        <a
          href="mailto:vkavouras@proton.me"
          class="contact-email"
          onclick={closePanel}
        >
          vkavouras@proton.me
        </a>
        <p class="label muted contact-note">
          Serious inquiries only. Price negotiable.
        </p>
      </div>
    </div>
  </div>
{/if}

<style>
  /* ── Strip ───────────────────────────────────────────────────────────── */
  .sale-strip {
    position: fixed;
    inset-block-start: 0;
    inset-inline: 0;
    z-index: 500;
    background: var(--color-ink);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.625rem 1.5rem;
    gap: 1rem;
    /* Height is exactly 2.25rem — matches nav margin-top in Nav.svelte */
  }
  @media (min-width: 640px)  { .sale-strip { padding-inline: 2.5rem; } }
  @media (min-width: 1024px) { .sale-strip { padding-inline: 4rem; } }
  @media (min-width: 1280px) { .sale-strip { padding-inline: 6rem; } }

  .strip-inner {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    background: none;
    border: none;
    padding: 0;
    flex: 1;
    text-align: left;
  }

  .strip-dot {
    width: 5px;
    height: 5px;
    border-radius: 50% !important;
    background: #4ade80; /* green — "available" signal */
    flex-shrink: 0;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }

  .strip-text {
    color: rgb(255 255 255 / 0.7);
    letter-spacing: 0.14em;
  }

  .strip-cta {
    color: rgb(255 255 255 / 0.45);
    letter-spacing: 0.14em;
    transition: color 0.2s;
    white-space: nowrap;
  }
  .strip-inner:hover .strip-cta { color: rgb(255 255 255 / 0.9); }

  .strip-dismiss {
    background: none;
    border: none;
    color: rgb(255 255 255 / 0.35);
    font-size: 1rem;
    line-height: 1;
    padding: 0.25rem;
    transition: color 0.2s;
    flex-shrink: 0;
  }
  .strip-dismiss:hover { color: rgb(255 255 255 / 0.8); }

  /* ── Panel ───────────────────────────────────────────────────────────── */
  .sale-panel {
    position: fixed;
    inset-block: 1rem;
    inset-inline: 1rem;
    max-width: 680px;
    margin-inline: auto;
    background: var(--color-white);
    z-index: 601;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--color-rule);
  }
  @media (min-width: 640px) {
    .sale-panel {
      inset-block: 3rem;
      inset-inline: 2rem;
    }
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.5rem 1rem;
    flex-shrink: 0;
    border-bottom: 1px solid var(--color-rule);
  }

  .panel-tag {
    color: #16a34a;
    letter-spacing: 0.18em;
  }

  .panel-body {
    overflow-y: auto;
    flex: 1;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    scrollbar-width: thin;
    scrollbar-color: var(--color-rule) transparent;
  }

  .panel-title {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-style: italic;
    font-variation-settings: 'wght' 400;
    letter-spacing: -0.02em;
    line-height: 1.05;
    color: var(--color-ink);
  }

  .panel-divider {
    height: 1px;
    background: var(--color-rule);
    flex-shrink: 0;
  }

  .panel-details {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  /* Detail blocks */
  .detail-block {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }

  .detail-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .detail-item {
    display: flex;
    gap: 0.875rem;
    align-items: baseline;
    font-size: 0.8125rem;
    font-variation-settings: 'wght' 300;
    color: var(--color-soft);
    line-height: 1.5;
  }

  .detail-check { opacity: 0.35; flex-shrink: 0; }

  /* Stack grid */
  .stack-grid {
    display: flex;
    flex-direction: column;
    border-top: 1px solid var(--color-rule);
  }

  .stack-row {
    display: grid;
    grid-template-columns: 90px 1fr;
    gap: 1rem;
    padding-block: 0.625rem;
    border-bottom: 1px solid var(--color-rule);
    align-items: center;
  }

  .stack-val {
    font-size: 0.8rem;
    font-variation-settings: 'wght' 300;
    color: var(--color-ink-soft);
  }

  .detail-note {
    font-size: 0.8125rem;
    font-variation-settings: 'wght' 300;
    line-height: 1.8;
    color: var(--color-soft);
    max-width: 52ch;
  }

  /* Contact */
  .panel-contact {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }

  .contact-line {
    font-size: 0.8125rem;
    font-variation-settings: 'wght' 300;
    color: var(--color-soft);
  }

  .contact-email {
    font-family: var(--font-sans);
    font-size: clamp(1rem, 3vw, 1.5rem);
    font-variation-settings: 'wght' 300;
    letter-spacing: -0.01em;
    color: var(--color-ink);
    border-bottom: 1px solid var(--color-rule);
    padding-bottom: 0.125rem;
    align-self: flex-start;
    transition: border-color 0.2s, opacity 0.2s;
  }
  .contact-email:hover { border-bottom-color: var(--color-ink); }

  .contact-note { margin-top: 0.25rem; }
</style>
