<script lang="ts">
  import { fade } from 'svelte/transition';
  import { createModal, panelIn } from '@lib/modal';

  let { category = 'Clothing' }: { category?: string } = $props();

  const modal = createModal();
  let open = $state(false);
  let panelEl = $state<HTMLElement | undefined>();

  const clothing = [
    { size: 'XS', it: '36', fr: '36', uk: '8',  us: '4',  chest: '82–85', waist: '62–65' },
    { size: 'S',  it: '38', fr: '38', uk: '10', us: '6',  chest: '86–89', waist: '66–69' },
    { size: 'M',  it: '40', fr: '40', uk: '12', us: '8',  chest: '90–93', waist: '70–73' },
    { size: 'L',  it: '42', fr: '42', uk: '14', us: '10', chest: '94–97', waist: '74–77' },
    { size: 'XL', it: '44', fr: '44', uk: '16', us: '12', chest: '98–101', waist: '78–81' },
  ];

  const shoes = [
    { eu: '39', uk: '6',   us: '7',   cm: '25.0' },
    { eu: '40', uk: '6.5', us: '7.5', cm: '25.5' },
    { eu: '41', uk: '7',   us: '8',   cm: '26.0' },
    { eu: '42', uk: '8',   us: '9',   cm: '26.5' },
    { eu: '43', uk: '9',   us: '10',  cm: '27.5' },
    { eu: '44', uk: '10',  us: '11',  cm: '28.0' },
  ];

  function openModal() {
    open = true;
    modal.open(panelEl);
  }

  function closeModal() {
    open = false;
    modal.close();
  }

  function onKeydown(e: KeyboardEvent) {
    if (open && modal.handleKeydown(panelEl, e)) closeModal();
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
    onclick={closeModal}
    transition:fade={{ duration: 300 }}
  ></div>

  <div
    class="sg-panel"
    role="dialog"
    aria-modal="true"
    aria-labelledby="sg-title"
    tabindex="-1"
    bind:this={panelEl}
    in:panelIn={{ y: 0.75, scale: true }}
    out:fade={{ duration: 200 }}
  >
    <div class="sg-head">
      <h2 class="label sg-title" id="sg-title">Size Guide</h2>
      <button class="label ghost-btn" onclick={closeModal} aria-label="Close size guide">Close</button>
    </div>
    <div class="rule"></div>

    <div class="sg-body">
      <p class="sg-note">
        All Voidhaus pieces are cut generously. If between sizes, size down.<br/>
        Measurements in centimetres.
      </p>

      {#if category === 'Footwear'}
        <table class="sg-table">
          <thead><tr>
            <th class="label" scope="col">EU</th><th class="label" scope="col">UK</th>
            <th class="label" scope="col">US</th><th class="label" scope="col">CM</th>
          </tr></thead>
          <tbody>
            {#each shoes as r}
              <tr>
                <td class="td-main">{r.eu}</td>
                <td>{r.uk}</td><td>{r.us}</td><td>{r.cm}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <table class="sg-table">
          <thead><tr>
            <th class="label" scope="col">Size</th><th class="label" scope="col">IT/EU</th>
            <th class="label" scope="col">FR</th><th class="label" scope="col">UK</th>
            <th class="label" scope="col">US</th><th class="label" scope="col">Chest</th><th class="label" scope="col">Waist</th>
          </tr></thead>
          <tbody>
            {#each clothing as r}
              <tr>
                <td class="td-main">{r.size}</td>
                <td>{r.it}</td><td>{r.fr}</td><td>{r.uk}</td>
                <td>{r.us}</td><td>{r.chest}</td><td>{r.waist}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}

      <div class="sg-note-block">
        <span class="label op-35">Fit note</span>
        <p class="sg-note">
          Voidhaus sizing runs true to our Italian pattern blocks.
          Outerwear is designed to layer — size up if wearing underneath.
          Contact <a href="mailto:studio@voidhaus.com" class="sg-link">studio@voidhaus.com</a> for styling advice.
        </p>
      </div>
    </div>
  </div>
{/if}

<style>
  .sg-backdrop { --backdrop-z: 500; background: var(--backdrop); }

  .sg-btn {
    background: none; border: none;
    border-bottom: 1px solid var(--color-rule);
    padding-bottom: 0.1rem;
    transition: opacity var(--duration-fast), border-color var(--duration-fast);
  }
  .sg-btn:hover { opacity: 1; border-bottom-color: var(--color-ink); }

  .sg-panel {
    position: fixed; inset-inline: var(--space-md); top: 50%; translate: 0 -50%;
    max-width: 720px; margin-inline: auto;
    background: var(--color-white);
    z-index: 501;
    display: flex; flex-direction: column;
    max-height: 85svh;
    border: 1px solid var(--color-rule);
  }
  @media (min-width: 640px) { .sg-panel { inset-inline: var(--space-xl); } }

  .sg-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.25rem var(--space-lg) var(--space-md); flex-shrink: 0;
  }
  .sg-title { color: var(--color-ink); }

  .sg-body {
    overflow-y: auto; padding: var(--space-lg);
    display: flex; flex-direction: column; gap: var(--space-xl); flex: 1;
  }

  .sg-note { font-size: var(--text-sm); font-variation-settings: var(--fw-normal); line-height: 1.7; color: var(--color-soft); }

  .sg-table { width: 100%; border-collapse: collapse; font-size: var(--text-sm); border: 1px solid var(--color-rule); }
  .sg-table th {
    text-align: left; padding: var(--space-sm) var(--space-md);
    border-bottom: 1px solid var(--color-rule);
    background: var(--color-off); font-size: var(--text-xs); opacity: var(--op-muted);
  }
  .sg-table td {
    padding: 0.875rem var(--space-md); border-bottom: 1px solid var(--color-rule);
    font-variation-settings: var(--fw-normal); color: var(--color-soft);
  }
  .sg-table tr:last-child td { border-bottom: none; }
  .sg-table tr:hover td { background: var(--color-off); }
  .td-main { font-variation-settings: var(--fw-medium); color: var(--color-ink); }

  .sg-note-block {
    display: flex; flex-direction: column; gap: var(--space-sm);
    padding-top: var(--space-md); border-top: 1px solid var(--color-rule);
  }
  .sg-link {
    color: var(--color-ink); border-bottom: 1px solid var(--color-rule);
    transition: border-color var(--duration-fast);
  }
  .sg-link:hover { border-bottom-color: var(--color-ink); }
</style>
