<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { lockScroll, unlockScroll } from '../lib/scrollLock';

  let open    = $state(false);
  let visible = $state(false);

  onMount(() => {
    visible = !document.documentElement.classList.contains('banner-dismissed');
  });

  function dismiss() {
    visible = false;
    document.documentElement.classList.add('banner-dismissed');
    try { sessionStorage.setItem('vh-sale-dismissed', '1'); } catch {}
  }

  function panelIn(node: Element) {
    return {
      duration: 440, easing: cubicOut,
      css: (t: number) => `opacity:${t};transform:translateY(${(1 - t) * 1.25}rem)`,
    };
  }
</script>

{#if visible}
  <div class="strip" transition:fade={{ duration: 280 }}>
    <button class="strip-btn" onclick={() => { open = true; lockScroll(); }}
      aria-label="This site is for sale — click to learn more">
      <span class="strip-dot" aria-hidden="true"></span>
      <span class="label strip-text">This site is available for purchase</span>
      <span class="label strip-cta">Learn more →</span>
    </button>
    <button class="label strip-dismiss ghost-btn" onclick={dismiss} aria-label="Dismiss">×</button>
  </div>
{/if}

{#if open}
  <div
    class="backdrop"
    style="--backdrop-z:600; background:rgb(28 27 25/0.5)"
    role="presentation"
    onclick={() => { open = false; unlockScroll(); }}
    transition:fade={{ duration: 280 }}
  ></div>

  <div class="panel" role="dialog" aria-modal="true" aria-label="Site for sale" in:panelIn out:fade={{ duration: 200 }}>
    <div class="panel-head">
      <span class="label panel-tag">Available</span>
      <button class="label ghost-btn" onclick={() => { open = false; unlockScroll(); }} aria-label="Close">Close</button>
    </div>

    <div class="panel-body">
      <h2 class="panel-title serif">This site<br/>is for sale.</h2>

      <div class="panel-rule"></div>

      <div class="detail-block">
        <span class="label muted detail-label">What you get</span>
        <ul class="detail-list">
          {#each [
            'Complete, production-ready website — deploy in minutes',
            'Full source code with clean, well-organised file structure',
            '12-piece luxury fashion catalog with editorial photography',
            'Working shopping cart — items persist between visits',
            'Size guide, stockists, privacy & terms pages',
            'Newsletter signup form — ready to connect to any email service',
            'Mobile-friendly across all screen sizes',
            'GitHub repository transfer included',
          ] as item}
            <li class="detail-item"><span class="label" aria-hidden="true">—</span><span>{item}</span></li>
          {/each}
        </ul>
      </div>

      <div class="detail-block">
        <span class="label muted detail-label">Built with</span>
        <div class="stack-grid">
          {#each [
            ['Framework',   'Astro 6 — blazing fast, great for SEO'],
            ['Interactivity','Svelte 5 — modern, minimal JavaScript'],
            ['Animations',  'GSAP — smooth, cinematic transitions'],
            ['Typography',  'DM Sans + Cormorant — self-hosted, no Google'],
            ['Deployment',  'Vercel-ready — one click to go live'],
          ] as [k, v]}
            <div class="stack-row">
              <span class="label muted">{k}</span>
              <span class="stack-val">{v}</span>
            </div>
          {/each}
        </div>
      </div>

      <div class="panel-rule"></div>

      <div class="panel-contact">
        <p class="contact-line">Interested? Get in touch:</p>
        <a href="mailto:vkavouras@proton.me" class="contact-email"
          onclick={() => { open = false; unlockScroll(); }}>vkavouras@proton.me</a>
        <p class="label muted">Serious inquiries only. Price negotiable.</p>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Strip */
  .strip {
    position: fixed; inset-block-start: 0; inset-inline: 0; z-index: 500;
    background: var(--color-ink);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.625rem 1.5rem; gap: 1rem;
  }
  @media (min-width: 640px)  { .strip { padding-inline: 2.5rem; } }
  @media (min-width: 1024px) { .strip { padding-inline: 4rem; } }
  @media (min-width: 1280px) { .strip { padding-inline: 6rem; } }

  .strip-btn {
    display: flex; align-items: center; gap: 0.875rem;
    background: none; border: none; padding: 0; flex: 1; text-align: left;
  }

  .strip-dot {
    width: 5px; height: 5px;
    border-radius: 50% !important;
    background: #4ade80; flex-shrink: 0;
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

  .strip-text { color: rgb(255 255 255 / 0.6); }
  .strip-cta  { color: rgb(255 255 255 / 0.9); margin-left: auto; white-space: nowrap; }
  .strip-dismiss { color: rgb(255 255 255 / 0.5) !important; }

  /* Panel */
  .panel {
    position: fixed; inset-inline: 0; inset-block: 0;
    width: min(680px, 100vw); margin-inline: auto;
    background: var(--color-white);
    z-index: 601;
    display: flex; flex-direction: column;
    border-inline: 1px solid var(--color-rule);
    overflow-y: auto;
  }

  .panel-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.5rem 2rem 1.25rem; border-bottom: 1px solid var(--color-rule);
    flex-shrink: 0;
  }
  .panel-tag { color: var(--color-ink); }

  .panel-body { padding: 2.5rem 2rem; display: flex; flex-direction: column; gap: 2rem; }

  .panel-title {
    font-size: clamp(2rem, 6vw, 3.5rem); font-style: italic;
    font-variation-settings: 'wght' 400; letter-spacing: -0.02em; line-height: 1.05;
    color: var(--color-ink);
  }

  .panel-rule { height: 1px; background: var(--color-rule); }

  .detail-block { display: flex; flex-direction: column; gap: 1rem; }
  .detail-label { display: block; }

  .detail-list { list-style: none; display: flex; flex-direction: column; gap: 0.6rem; }
  .detail-item { display: flex; gap: 0.75rem; font-size: 0.8125rem; font-variation-settings: 'wght' 300; color: var(--color-soft); line-height: 1.5; }

  .stack-grid { display: flex; flex-direction: column; border-top: 1px solid var(--color-rule); }
  .stack-row  {
    display: flex; justify-content: space-between; align-items: baseline;
    gap: 1rem; padding-block: 0.75rem; border-bottom: 1px solid var(--color-rule);
    flex-wrap: wrap;
  }
  .stack-val  { font-size: 0.8125rem; font-variation-settings: 'wght' 300; color: var(--color-ink-soft); text-align: right; }

  .panel-contact { display: flex; flex-direction: column; gap: 0.75rem; }
  .contact-line  { font-size: 0.875rem; font-variation-settings: 'wght' 300; color: var(--color-soft); }
  .contact-email {
    font-size: 1rem; font-variation-settings: 'wght' 300; color: var(--color-ink);
    border-bottom: 1px solid var(--color-rule); align-self: flex-start;
    transition: border-color 0.2s;
  }
  .contact-email:hover { border-color: var(--color-ink); }
</style>
