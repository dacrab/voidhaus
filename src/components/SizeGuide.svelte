<script lang="ts">
  import { fade } from 'svelte/transition';
  import { cubicOut, cubicIn } from 'svelte/easing';

  let { category = 'Clothing' }: { category?: string } = $props();

  let open = $state(false);

  const clothingSizes = [
    { size: 'XS', it: '36', fr: '36', uk: '8',  us: '4',  chest: '82–85', waist: '62–65' },
    { size: 'S',  it: '38', fr: '38', uk: '10', us: '6',  chest: '86–89', waist: '66–69' },
    { size: 'M',  it: '40', fr: '40', uk: '12', us: '8',  chest: '90–93', waist: '70–73' },
    { size: 'L',  it: '42', fr: '42', uk: '14', us: '10', chest: '94–97', waist: '74–77' },
    { size: 'XL', it: '44', fr: '44', uk: '16', us: '12', chest: '98–101', waist: '78–81' },
  ];

  const shoesSizes = [
    { eu: '39', uk: '6',   us: '7',   cm: '25.0' },
    { eu: '40', uk: '6.5', us: '7.5', cm: '25.5' },
    { eu: '41', uk: '7',   us: '8',   cm: '26.0' },
    { eu: '42', uk: '8',   us: '9',   cm: '26.5' },
    { eu: '43', uk: '9',   us: '10',  cm: '27.5' },
    { eu: '44', uk: '10',  us: '11',  cm: '28.0' },
  ];

  const isShoes = category === 'Footwear';

  function panelTransition(node: Element) {
    return {
      duration: 400,
      easing: cubicOut,
      css: (t: number) => `
        opacity: ${t};
        transform: translateY(${(1 - t) * 0.75}rem);
      `,
    };
  }
</script>

<button
  class="sg-trigger label muted"
  onclick={() => open = true}
  type="button"
  aria-haspopup="dialog"
>
  Size Guide
</button>

{#if open}
  <!-- Backdrop -->
  <div
    class="sg-backdrop"
    role="presentation"
    onclick={() => open = false}
    transition:fade={{ duration: 250 }}
  ></div>

  <!-- Panel -->
  <div
    class="sg-panel"
    role="dialog"
    aria-modal="true"
    aria-label="Size guide"
    transition:panelTransition
  >
    <div class="sg-header">
      <h2 class="sg-title label">Size Guide</h2>
      <button
        class="label sg-close muted"
        onclick={() => open = false}
        aria-label="Close size guide"
      >
        Close
      </button>
    </div>
    <div class="rule"></div>

    <div class="sg-body">
      <p class="sg-note">
        All Voidhaus pieces are cut generously. If between sizes, size down.<br/>
        Measurements in centimetres.
      </p>

      {#if isShoes}
        <table class="sg-table">
          <thead>
            <tr>
              <th class="label">EU</th>
              <th class="label">UK</th>
              <th class="label">US</th>
              <th class="label">CM</th>
            </tr>
          </thead>
          <tbody>
            {#each shoesSizes as row}
              <tr>
                <td class="td-main">{row.eu}</td>
                <td>{row.uk}</td>
                <td>{row.us}</td>
                <td>{row.cm}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <table class="sg-table">
          <thead>
            <tr>
              <th class="label">Size</th>
              <th class="label">IT/EU</th>
              <th class="label">FR</th>
              <th class="label">UK</th>
              <th class="label">US</th>
              <th class="label">Chest</th>
              <th class="label">Waist</th>
            </tr>
          </thead>
          <tbody>
            {#each clothingSizes as row}
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
      {/if}

      <div class="sg-care">
        <span class="label op-35">Fit note</span>
        <p class="care-text">
          Voidhaus sizing runs true to our Italian pattern blocks.
          Our outerwear is designed to layer — size up if wearing underneath.
          Contact <a href="/contact" class="care-link">studio@voidhaus.com</a> for personal styling advice.
        </p>
      </div>
    </div>
  </div>
{/if}

<style>
  .sg-trigger {
    background: none;
    border: none;
    border-bottom: 1px solid var(--color-rule);
    padding-bottom: 0.1rem;
    transition: opacity 0.2s, border-color 0.2s;
    cursor: pointer;
  }
  .sg-trigger:hover { opacity: 1 !important; border-bottom-color: var(--color-ink); }

  /* Backdrop */
  .sg-backdrop {
    position: fixed;
    inset: 0;
    background: rgb(28 27 25 / 0.45);
    z-index: 500;
  }

  /* Panel — centered modal */
  .sg-panel {
    position: fixed;
    inset-inline: 1rem;
    inset-block: 50%;
    translate: 0 -50%;
    max-width: 720px;
    margin-inline: auto;
    background: var(--color-white);
    z-index: 501;
    display: flex;
    flex-direction: column;
    max-height: 85svh;
    border: 1px solid var(--color-rule);
  }
  @media (min-width: 640px) { .sg-panel { inset-inline: 2rem; } }

  .sg-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.5rem 1rem;
    flex-shrink: 0;
  }

  .sg-title { color: var(--color-ink); }

  .sg-close {
    background: none; border: none;
    color: var(--color-ink); opacity: 0.4;
    transition: opacity 0.2s; padding: 0;
  }
  .sg-close:hover { opacity: 1; }

  .sg-body {
    overflow-y: auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    flex: 1;
  }

  .sg-note {
    font-size: 0.8125rem;
    font-variation-settings: 'wght' 300;
    line-height: 1.7;
    color: var(--color-soft);
  }

  /* Table */
  .sg-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8rem;
    border: 1px solid var(--color-rule);
  }

  .sg-table th {
    text-align: left;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-rule);
    background: var(--color-off);
    font-size: 0.575rem;
    opacity: 0.5;
  }

  .sg-table td {
    padding: 0.875rem 1rem;
    border-bottom: 1px solid var(--color-rule);
    font-variation-settings: 'wght' 300;
    color: var(--color-soft);
  }

  .sg-table tr:last-child td { border-bottom: none; }

  .td-main {
    font-variation-settings: 'wght' 400 !important;
    color: var(--color-ink) !important;
  }

  .sg-table tr:hover td { background: var(--color-off); }

  /* Care note */
  .sg-care {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-rule);
  }

  .care-text {
    font-size: 0.8125rem;
    font-variation-settings: 'wght' 300;
    line-height: 1.75;
    color: var(--color-soft);
  }

  .care-link {
    color: var(--color-ink);
    border-bottom: 1px solid var(--color-rule);
    transition: border-color 0.2s;
  }
  .care-link:hover { border-bottom-color: var(--color-ink); }
</style>
