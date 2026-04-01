<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { lockScroll, unlockScroll } from '../lib/scrollLock';
  import { trapFocus } from '../lib/focusTrap';
  import { SITE } from '../data/site';

  const STORAGE_KEY = 'vh-forsale-dismissed';

  let open      = $state(false);
  let dismissed = $state(true); // hidden until mounted to avoid flash
  let prevFocus = $state<HTMLElement | null>(null);

  onMount(() => {
    dismissed = sessionStorage.getItem(STORAGE_KEY) === '1';
  });

  function openModal() {
    prevFocus = document.activeElement as HTMLElement;
    open = true;
    lockScroll();
    requestAnimationFrame(() => {
      document.getElementById('fs-panel')?.focus();
    });
  }

  function closeModal() {
    open = false;
    unlockScroll();
    prevFocus?.focus();
  }

  function dismiss() {
    dismissed = true;
    sessionStorage.setItem(STORAGE_KEY, '1');
    if (open) closeModal();
  }

  function panelIn(node: Element) {
    return {
      duration: 400, easing: cubicOut,
      css: (t: number) => `opacity:${t}; transform:translateY(${(1 - t) * 1.5}rem) scale(${0.98 + t * 0.02})`,
    };
  }

  function stripIn(node: Element) {
    return {
      duration: 320, easing: cubicOut,
      css: (t: number) => `opacity:${t}; transform:translateY(${(1 - t) * 100}%)`,
    };
  }
</script>

<svelte:window onkeydown={e => { if (open && e.key === 'Escape') { e.preventDefault(); closeModal(); } }} />

{#if !dismissed}
  <!-- Strip -->
  <div class="strip" in:stripIn>
    <button class="strip-trigger" onclick={openModal} aria-haspopup="dialog" aria-expanded={open}>
      <span class="dot" aria-hidden="true"></span>
      <span class="label strip-label">Available for your brand</span>
      <span class="label strip-cta">Enquire →</span>
    </button>
    <button class="label strip-dismiss" onclick={dismiss} aria-label="Dismiss">✕</button>
  </div>
{/if}

<!-- Backdrop -->
{#if open}
  <div
    class="backdrop"
    style="--backdrop-z:600; background:rgb(28 27 25/0.45)"
    role="presentation"
    onclick={closeModal}
    transition:fade={{ duration: 280 }}
  ></div>

  <!-- Panel -->
  <div
    id="fs-panel"
    class="panel"
    role="dialog"
    aria-modal="true"
    aria-labelledby="fs-title"
    tabindex="-1"
    onkeydown={e => {
      if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
      const panel = document.getElementById('fs-panel');
      if (panel) trapFocus(panel, e);
    }}
    in:panelIn
    out:fade={{ duration: 200 }}
  >
    <div class="panel-head">
      <span class="label muted" id="fs-title">Available</span>
      <button class="label ghost-btn" onclick={closeModal} aria-label="Close">Close</button>
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
      <a href={`mailto:${SITE.email.enquiry}`} class="enquire-btn label">Get in touch</a>
      <span class="label muted">{SITE.email.enquiry}</span>
    </div>
  </div>
{/if}

<style>
  /* ── Strip ───────────────────────────────────────────────────────────── */
  .strip {
    position: fixed; inset-inline: 0; bottom: 0; z-index: 500;
    display: flex; align-items: stretch;
    background: var(--color-ink); color: var(--color-white);
  }

  .strip-trigger {
    flex: 1; display: flex; align-items: center; justify-content: center;
    gap: 1rem; padding: 0.75rem 1.5rem;
    background: none; border: none; color: inherit; cursor: pointer;
    transition: background 0.2s;
  }
  .strip-trigger:hover { background: rgb(255 255 255 / 0.06); }

  .dot {
    width: 0.4rem; height: 0.4rem; flex-shrink: 0;
    background: #6ee7a0; border-radius: 50%;
    animation: pulse 2.4s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.3; }
  }

  .strip-cta { opacity: 0.5; transition: opacity 0.2s; }
  .strip-trigger:hover .strip-cta { opacity: 1; }

  .strip-dismiss {
    display: flex; align-items: center; padding-inline: 1.25rem;
    background: none; border: none; border-left: 1px solid rgb(255 255 255 / 0.1);
    color: inherit; opacity: 0.4; cursor: pointer; transition: opacity 0.2s;
  }
  .strip-dismiss:hover { opacity: 1; }

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
    will-change: transform, opacity;
    outline: none;
  }

  .panel-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.25rem 1.5rem 1rem;
  }

  .panel-body {
    padding: 1.5rem;
    display: flex; flex-direction: column; gap: 1.25rem;
  }

  .panel-title {
    font-size: clamp(1.5rem, 4vw, 2rem);
    font-style: italic; line-height: 1.2;
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
    display: inline-block; padding: 0.65rem 1.5rem;
    background: var(--color-ink); color: var(--color-white);
    text-decoration: none; transition: background 0.2s;
  }
  .enquire-btn:hover { background: var(--color-ink-soft); }

  /* ── Desktop — float bottom-right ───────────────────────────────────── */
  @media (min-width: 640px) {
    .panel {
      inset-block: auto 1rem;
      inset-inline: auto 1.5rem;
      border-radius: 0.75rem;
      margin-inline: 0;
    }
    .strip-trigger { justify-content: flex-start; padding-inline-start: 2rem; }
  }
</style>
