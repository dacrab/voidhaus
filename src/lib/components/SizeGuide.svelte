<script lang="ts">
  import { tick } from "svelte";
  import { SITE } from "#lib/data/site.js";
  import { centrePanel, createModal } from "#lib/utils/modal.js";
  import { fade, MOTION } from "#lib/utils/motion.js";
  import { portal } from "#lib/utils/portal.js";

  const modal = createModal();

  const clothing = [
    { size: "XS", it: "36", fr: "36", uk: "8", us: "4", chest: "82–85", waist: "62–65" },
    { size: "S", it: "38", fr: "38", uk: "10", us: "6", chest: "86–89", waist: "66–69" },
    { size: "M", it: "40", fr: "40", uk: "12", us: "8", chest: "90–93", waist: "70–73" },
    { size: "L", it: "42", fr: "42", uk: "14", us: "10", chest: "94–97", waist: "74–77" },
    { size: "XL", it: "44", fr: "44", uk: "16", us: "12", chest: "98–101", waist: "78–81" },
  ];

  let open = $state(false);
  let panelEl = $state<HTMLElement>();

  async function openModal() {
    open = true;
    await tick();
    modal.open(panelEl);
  }

  function closeModal() {
    open = false;
    modal.close();
  }

  function onKeydown(event: KeyboardEvent) {
    if (open && modal.handleKeydown(panelEl, event)) closeModal();
  }
</script>

<svelte:window onkeydown={onKeydown} />

<button class="sg-btn label muted" onclick={openModal} type="button" aria-haspopup="dialog">
  Size Guide
</button>

{#if open}
  <div
    class="backdrop sg-backdrop"
    role="presentation"
    aria-hidden="true"
    onclick={closeModal}
    use:portal
    transition:fade={{ duration: MOTION.base }}
  ></div>

  <div
    class="sg-panel"
    role="dialog"
    aria-modal="true"
    aria-labelledby="sg-title"
    tabindex="-1"
    bind:this={panelEl}
    use:portal
    transition:centrePanel={{ y: 0.75, scale: true }}
  >
    <div class="sg-head">
      <h2 class="label sg-title" id="sg-title">Size Guide</h2>
      <button class="label ghost-btn" type="button" onclick={closeModal} aria-label="Close size guide">Close</button>
    </div>
    <div class="rule"></div>

    <div class="sg-body">
      <p class="sg-note">
        All Voidhaus pieces are cut generously. If between sizes, size down.<br />
        Measurements in centimetres.
      </p>

      <div class="sg-scroll">
        <table class="sg-table">
          <thead>
            <tr>
              <th class="label" scope="col">Size</th>
              <th class="label" scope="col">IT/EU</th>
              <th class="label" scope="col">FR</th>
              <th class="label" scope="col">UK</th>
              <th class="label" scope="col">US</th>
              <th class="label" scope="col">Chest</th>
              <th class="label" scope="col">Waist</th>
            </tr>
          </thead>
          <tbody>
            {#each clothing as row (row.size)}
              <tr>
                <td class="td-main">{row.size}</td>
                <td>{row.it}</td>
                <td>{row.fr}</td>
                <td>{row.uk}</td>
                <td>{row.us}</td>
                <td>{row.chest}</td>
                <td>{row.waist}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <div class="sg-note-block">
        <span class="label muted">Fit note</span>
        <p class="sg-note">
          Voidhaus sizing runs true to our Italian pattern blocks. Outerwear is designed to layer — size up if wearing
          underneath. Contact <a href="mailto:{SITE.email.studio}" class="sg-link">{SITE.email.studio}</a> for styling
          advice.
        </p>
      </div>
    </div>
  </div>
{/if}

<style>
  .sg-backdrop { --backdrop-z: 500; background: var(--scrim-medium); }

  .sg-btn {
    background: none; border: none;
    border-bottom: 1px solid var(--color-rule);
    padding-bottom: 0.1rem;
    transition:
      color var(--duration-fast) var(--ease-out),
      border-color var(--duration-fast) var(--ease-out);
  }
  .sg-btn:hover { color: var(--color-ink); border-bottom-color: var(--color-ink); }

  .sg-panel {
    position: fixed; inset-inline: var(--spacing-md); top: 50%; translate: 0 -50%;
    max-width: 720px; margin-inline: auto;
    background: var(--color-canvas);
    z-index: 501;
    display: flex; flex-direction: column;
    max-height: 85svh;
    border: 1px solid var(--color-rule);
  }
  @media (min-width: 640px) { .sg-panel { inset-inline: var(--spacing-xl); } }

  .sg-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.25rem var(--spacing-lg) var(--spacing-md); flex-shrink: 0;
  }
  .sg-title { color: var(--color-ink); }

  .sg-body {
    overflow-y: auto; padding: var(--spacing-xl);
    display: flex; flex-direction: column; gap: var(--spacing-2xl); flex: 1;
  }

  .sg-note {
    font-size: var(--text-sm); font-variation-settings: var(--fw-normal);
    line-height: 1.7; color: var(--color-soft);
  }

  .sg-table { width: 100%; border-collapse: collapse; font-size: var(--text-sm); border: 1px solid var(--color-rule); }
  .sg-table th {
    text-align: left; padding: var(--spacing-sm) var(--spacing-md);
    border-bottom: 1px solid var(--color-rule);
    background: var(--color-surface); color: var(--color-muted); font-size: var(--text-xs);
  }
  .sg-table td {
    padding: 0.875rem var(--spacing-md); border-bottom: 1px solid var(--color-rule);
    font-variation-settings: var(--fw-normal); color: var(--color-soft);
  }
  .sg-table tr:last-child td { border-bottom: none; }
  .sg-table tr:hover td { background: var(--color-surface); }
  .td-main { font-variation-settings: var(--fw-medium); color: var(--color-ink); }

  .sg-note-block {
    display: flex; flex-direction: column; gap: var(--spacing-sm);
    padding-top: var(--spacing-md); border-top: 1px solid var(--color-rule);
  }
  .sg-link {
    color: var(--color-ink); border-bottom: 1px solid var(--color-rule);
    transition: border-color var(--duration-fast) var(--ease-out);
  }
  .sg-link:hover { border-bottom-color: var(--color-ink); }
  .sg-scroll { overflow-x: auto; }
</style>
