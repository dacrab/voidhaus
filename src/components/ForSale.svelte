<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { createModal, panelIn } from '../lib/modal';
  import { SITE } from '../data/site';

  const STORAGE_KEY = 'vh-forsale-dismissed';
  const modal = createModal();

  let open = $state(false);
  let dismissed = $state(true);

  onMount(() => {
    dismissed = sessionStorage.getItem(STORAGE_KEY) === '1';
  });

  function openModal() {
    open = true;
    modal.open();
    requestAnimationFrame(() => document.getElementById('fs-panel')?.focus());
  }

  function closeModal() {
    open = false;
    modal.close();
  }

  function dismiss() {
    dismissed = true;
    sessionStorage.setItem(STORAGE_KEY, '1');
    if (open) closeModal();
  }

  function onKeydown(e: KeyboardEvent) {
    if (open && e.key === 'Escape') {
      e.preventDefault();
      closeModal();
    }
  }

  const stripIn = (_node: Element) => ({
    duration: 300, easing: cubicOut,
    css: (t: number) => `opacity:${t}; transform:translateY(${(1 - t) * 100}%)`,
  });
</script>

<svelte:window onkeydown={onKeydown} />

{#if !dismissed}
  <div class="strip" in:stripIn>
    <button class="strip-trigger" onclick={openModal} aria-haspopup="dialog" aria-expanded={open}>
      <span class="dot" aria-hidden="true"></span>
      <span class="label strip-label">Available for your brand</span>
      <span class="label strip-cta">Enquire →</span>
    </button>
    <button class="label strip-dismiss" onclick={dismiss} aria-label="Dismiss">✕</button>
  </div>
{/if}

{#if open}
  <div
    class="backdrop fs-backdrop"
    role="presentation"
    onclick={closeModal}
    transition:fade={{ duration: 300 }}
  ></div>

  <div
    id="fs-panel"
    class="panel"
    role="dialog"
    aria-modal="true"
    aria-labelledby="fs-title"
    tabindex="-1"
    in:panelIn={{ y: 1.5, scale: true }}
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
  .fs-backdrop { --backdrop-z: 600; background: var(--backdrop-modal); }

  /* ── Strip ───────────────────────────────────────────────────────────── */
  .strip {
    position: fixed; inset-inline: 0; bottom: 0; z-index: 500;
    display: flex; align-items: stretch;
    background: var(--color-ink); color: var(--color-white);
  }

  .strip-trigger {
    flex: 1; display: flex; align-items: center; justify-content: center;
    gap: var(--space-md); padding: var(--space-sm) var(--space-lg);
    background: none; border: none; color: inherit; cursor: pointer;
    transition: background var(--duration-fast);
  }
  .strip-trigger:hover { background: var(--scrim-dark-light); }

  .dot {
    width: 0.4rem; height: 0.4rem; flex-shrink: 0;
    background: var(--color-accent); border-radius: var(--radius-full);
    animation: pulse 2.4s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: var(--opacity-disabled); }
  }

  .strip-cta { opacity: var(--opacity-muted); transition: opacity var(--duration-fast); }
  .strip-trigger:hover .strip-cta { opacity: 1; }

  .strip-dismiss {
    display: flex; align-items: center; padding-inline: 1.25rem;
    background: none; border: none; border-left: 1px solid var(--scrim-dark-light);
    color: inherit; opacity: var(--opacity-muted); cursor: pointer; transition: opacity var(--duration-fast);
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
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    display: flex; flex-direction: column;
    will-change: transform, opacity;
    outline: none;
  }

  .panel-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.25rem var(--space-lg) var(--space-md);
  }

  .panel-body {
    padding: var(--space-lg);
    display: flex; flex-direction: column; gap: 1.25rem;
  }

  .panel-title {
    font-size: clamp(var(--text-xl), 4vw, var(--text-2xl));
    font-style: italic; line-height: 1.2;
    color: var(--color-ink);
  }

  .panel-desc { font-size: var(--text-base); line-height: 1.65; }

  .features {
    list-style: none;
    display: flex; flex-direction: column; gap: 0.6rem;
    opacity: var(--opacity-secondary);
  }
  .features li::before { content: '—'; margin-inline-end: var(--space-xs); }

  .panel-foot {
    display: flex; align-items: center; justify-content: space-between;
    padding: var(--space-md) var(--space-lg) 1.25rem; gap: var(--space-md);
  }

  .enquire-btn {
    display: inline-block; padding: 0.65rem var(--space-lg);
    background: var(--color-ink); color: var(--color-white);
    text-decoration: none; transition: background var(--duration-fast);
  }
  .enquire-btn:hover { background: var(--color-ink-soft); }

  /* ── Desktop — float bottom-right ───────────────────────────────────── */
  @media (min-width: 640px) {
    .panel {
      inset-block: auto var(--space-md);
      inset-inline: auto var(--space-lg);
      border-radius: var(--radius-lg);
      margin-inline: 0;
    }
    .strip-trigger { justify-content: flex-start; padding-inline-start: var(--space-xl); }
  }
</style>
