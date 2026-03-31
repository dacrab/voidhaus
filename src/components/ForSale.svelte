<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { lockScroll, unlockScroll } from '../lib/scrollLock';

  let visible   = $state(false);
  let open      = $state(false);
  let panelEl   = $state<HTMLElement | undefined>();
  let prevFocus = $state<HTMLElement | null>(null);

  onMount(() => {
    visible = !document.documentElement.classList.contains('banner-dismissed');
  });

  function dismiss() {
    visible = false;
    document.documentElement.classList.add('banner-dismissed');
    try { sessionStorage.setItem('vh-sale-dismissed', '1'); } catch {}
  }

  async function openPanel() {
    prevFocus = document.activeElement as HTMLElement;
    open = true;
    lockScroll();
    await tick();
    panelEl?.querySelector<HTMLElement>('button,[href]')?.focus();
  }

  function closePanel() {
    open = false;
    unlockScroll();
    prevFocus?.focus();
  }

  function onKey(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === 'Escape') { closePanel(); return; }
    if (e.key !== 'Tab' || !panelEl) return;
    const els = panelEl.querySelectorAll<HTMLElement>('button:not([disabled]),[href],input,[tabindex]:not([tabindex="-1"])');
    if (!els.length) return;
    if (e.shiftKey && document.activeElement === els[0]) {
      e.preventDefault(); els[els.length - 1].focus();
    } else if (!e.shiftKey && document.activeElement === els[els.length - 1]) {
      e.preventDefault(); els[0].focus();
    }
  }

  function slideUp(node: Element) {
    return {
      duration: 480, easing: cubicOut,
      css: (t: number) => `opacity:${t};transform:translateY(${(1 - t) * 2}rem)`,
    };
  }
</script>

<svelte:window onkeydown={onKey} />

<!-- ── Banner strip ───────────────────────────────────────────────────── -->
{#if visible}
  <div class="strip" role="banner" aria-label="Site for sale notice" transition:fade={{ duration: 260 }}>
    <button class="strip-main" onclick={openPanel} aria-label="This site is for sale — learn more">
      <span class="dot" aria-hidden="true"></span>
      <span class="label strip-msg">This site is available for purchase</span>
      <span class="label strip-cta" aria-hidden="true">Learn more →</span>
    </button>
    <button class="label strip-close" onclick={dismiss} aria-label="Dismiss banner">×</button>
  </div>
{/if}

<!-- ── Info panel ─────────────────────────────────────────────────────── -->
{#if open}
  <div
    class="backdrop"
    style="--backdrop-z:600;background:rgb(28 27 25/0.55)"
    role="presentation"
    onclick={closePanel}
    transition:fade={{ duration: 260 }}
  ></div>

  <div
    class="panel"
    role="dialog"
    aria-modal="true"
    aria-label="Site for sale"
    bind:this={panelEl}
    in:slideUp
    out:fade={{ duration: 180 }}
  >
    <!-- Header -->
    <div class="panel-hd">
      <div class="panel-hd-l">
        <span class="dot" aria-hidden="true"></span>
        <span class="label">Available for acquisition</span>
      </div>
      <button class="label ghost-btn" onclick={closePanel} aria-label="Close">Close</button>
    </div>

    <div class="panel-body">

      <!-- Title -->
      <h2 class="panel-title serif">This site<br/>is for sale.</h2>

      <div class="rule"></div>

      <!-- What you get -->
      <section class="block" aria-labelledby="what-label">
        <span class="label muted block-label" id="what-label">What you get</span>
        <ul class="item-list">
          {#each [
            'Complete, production-ready website — deploy in minutes',
            'Full source code with clean, well-organised file structure',
            '12-piece luxury fashion catalog with editorial photography',
            'Working shopping cart with localStorage persistence',
            'Size guide, stockists, privacy & terms pages',
            'Newsletter signup ready to connect to any email provider',
            'Fully responsive across all screen sizes',
            'GitHub repository transfer included',
          ] as item}
            <li><span class="label" aria-hidden="true">—</span><span>{item}</span></li>
          {/each}
        </ul>
      </section>

      <!-- Stack -->
      <section class="block" aria-labelledby="stack-label">
        <span class="label muted block-label" id="stack-label">Built with</span>
        <dl class="stack">
          {#each [
            ['Framework',    'Astro 6 — blazing fast, great for SEO'],
            ['Interactivity','Svelte 5 — modern, minimal JavaScript'],
            ['Animations',   'GSAP — smooth, cinematic transitions'],
            ['Typography',   'DM Sans + Cormorant — self-hosted, no Google'],
            ['Deployment',   'Vercel-ready — one click to go live'],
          ] as [k, v]}
            <div class="stack-row">
              <dt class="label muted">{k}</dt>
              <dd>{v}</dd>
            </div>
          {/each}
        </dl>
      </section>

      <div class="rule"></div>

      <!-- Contact -->
      <section class="contact">
        <p class="contact-note">Interested? Reach out directly:</p>
        <a href="mailto:vkavouras@proton.me" class="contact-email" onclick={closePanel}>
          vkavouras@proton.me
        </a>
        <p class="label muted">Serious inquiries only · Price negotiable</p>
      </section>

    </div>
  </div>
{/if}

<style>
  /* ── Strip ───────────────────────────────────────────────────────── */
  .strip {
    position: fixed; inset-block-start: 0; inset-inline: 0; z-index: 500;
    background: var(--color-ink);
    display: flex; align-items: center;
    padding-block: 0.6rem;
    padding-inline: 1.5rem; gap: 1rem;
  }
  @media (min-width: 640px)  { .strip { padding-inline: 2.5rem; } }
  @media (min-width: 1024px) { .strip { padding-inline: 4rem; } }
  @media (min-width: 1280px) { .strip { padding-inline: 6rem; } }

  .strip-main {
    flex: 1; display: flex; align-items: center; gap: 0.75rem;
    background: none; border: none; padding: 0; text-align: left;
    cursor: pointer;
  }

  .dot {
    width: 6px; height: 6px; flex-shrink: 0;
    border-radius: 50% !important;
    background: #4ade80;
    animation: pulse 2.4s ease-in-out infinite;
  }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }

  .strip-msg { color: rgb(255 255 255 / 0.65); }
  .strip-cta {
    color: rgb(255 255 255 / 0.9);
    margin-inline-start: auto; white-space: nowrap;
    display: none;
  }
  @media (min-width: 480px) { .strip-cta { display: block; } }

  .strip-close {
    background: none; border: none; padding: 0;
    color: rgb(255 255 255 / 0.45); font-size: 1.1rem;
    line-height: 1; cursor: pointer;
    transition: color 0.15s; flex-shrink: 0;
  }
  .strip-close:hover { color: rgb(255 255 255 / 0.9); }

  /* ── Panel ───────────────────────────────────────────────────────── */
  .panel {
    position: fixed; inset-block: 0; inset-inline: 0;
    width: min(640px, 100vw); margin-inline: auto;
    background: var(--color-white);
    z-index: 601;
    display: flex; flex-direction: column;
    border-inline: 1px solid var(--color-rule);
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .panel-hd {
    position: sticky; top: 0;
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.25rem 2rem;
    background: var(--color-white);
    border-bottom: 1px solid var(--color-rule);
    z-index: 1; flex-shrink: 0;
  }
  .panel-hd-l { display: flex; align-items: center; gap: 0.6rem; }

  .panel-body {
    padding: 2.5rem 2rem;
    display: flex; flex-direction: column; gap: 2.5rem;
  }

  .panel-title {
    font-size: clamp(2.25rem, 7vw, 4rem);
    font-style: italic; font-variation-settings: 'wght' 400;
    letter-spacing: -0.02em; line-height: 1.05;
    color: var(--color-ink);
  }

  /* Blocks */
  .block { display: flex; flex-direction: column; gap: 1.25rem; }
  .block-label { display: block; }

  .item-list {
    list-style: none;
    display: flex; flex-direction: column; gap: 0.55rem;
  }
  .item-list li {
    display: flex; gap: 0.75rem;
    font-size: 0.8125rem; font-variation-settings: 'wght' 300;
    color: var(--color-soft); line-height: 1.55;
  }
  .item-list .label { flex-shrink: 0; margin-top: 0.05rem; }

  .stack { border-top: 1px solid var(--color-rule); }
  .stack-row {
    display: flex; justify-content: space-between;
    align-items: baseline; gap: 1rem; flex-wrap: wrap;
    padding-block: 0.8rem;
    border-bottom: 1px solid var(--color-rule);
  }
  .stack-row dd {
    font-size: 0.8125rem; font-variation-settings: 'wght' 300;
    color: var(--color-ink-soft); text-align: right;
  }

  /* Contact */
  .contact { display: flex; flex-direction: column; gap: 0.875rem; }
  .contact-note {
    font-size: 0.875rem; font-variation-settings: 'wght' 300; color: var(--color-soft);
  }
  .contact-email {
    font-size: clamp(1rem, 2.5vw, 1.25rem);
    font-variation-settings: 'wght' 300; color: var(--color-ink);
    border-bottom: 1px solid var(--color-rule);
    align-self: flex-start; padding-bottom: 0.1rem;
    transition: border-color 0.2s;
  }
  .contact-email:hover { border-color: var(--color-ink); }
</style>
