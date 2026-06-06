<script lang="ts">
  import { SITE } from '$lib/data/site';
  import PageHeader from '$lib/components/PageHeader.svelte';

  let name = $state('');
  let email = $state('');
  let message = $state('');
  let sent = $state(false);
  let error = $state('');

  async function handleSubmit(e: Event) {
    e.preventDefault();
    error = '';
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (res.ok) {
        sent = true;
        name = ''; email = ''; message = '';
      } else {
        error = 'Something went wrong. Please try again.';
      }
    } catch {
      error = 'Network error. Please try again.';
    }
  }

  
</script>

<svelte:head>
  <title>Contact — VOIDHAUS</title>
</svelte:head>

<PageHeader label="Contact" title="Get in Touch" />

<div class="wrap">
  <div class="rule"></div>
  <div class="grid gap-2xl md:grid-cols-2 md:gap-4xl py-2xl md:py-3xl">
    <div class="flex flex-col gap-xl" data-anim="scroll">
      {#if sent}
        <div class="flex flex-col gap-sm">
          <span class="label fw-medium">Message sent</span>
          <p class="text-[var(--color-soft)] leading-[1.85]">Thank you for reaching out. We will respond within two business days.</p>
        </div>
      {:else}
        <form class="flex flex-col gap-lg" onsubmit={handleSubmit}>
          <div class="flex flex-col gap-sm">
            <label class="label muted" for="contact-name">Name</label>
            <input id="contact-name" type="text" bind:value={name} required
              class="form-input" autocomplete="name" />
          </div>
          <div class="flex flex-col gap-sm">
            <label class="label muted" for="contact-email">Email</label>
            <input id="contact-email" type="email" bind:value={email} required
              class="form-input" autocomplete="email" />
          </div>
          <div class="flex flex-col gap-sm">
            <label class="label muted" for="contact-message">Message</label>
            <textarea id="contact-message" bind:value={message} required rows="5"
              class="form-input" style="min-height:10rem"></textarea>
          </div>
          {#if error}
            <p class="label text-red-400">{error}</p>
          {/if}
          <button type="submit" class="btn-outline" style="max-width:16rem">
            <span class="label">Send</span>
          </button>
        </form>
      {/if}
    </div>

    <div class="flex flex-col gap-xl" data-anim="scroll">
      <div class="flex flex-col gap-sm">
        <span class="label muted">Studio</span>
        <a href="mailto:{SITE.email.studio}" class="muted-link fw-normal">{SITE.email.studio}</a>
      </div>
      <div class="flex flex-col gap-sm">
        <span class="label muted">Press</span>
        <a href="mailto:{SITE.email.press}" class="muted-link fw-normal">{SITE.email.press}</a>
      </div>
      <div class="flex flex-col gap-sm">
        <span class="label muted">Address</span>
        {#each SITE.address as line}
          <span class="fw-normal text-[var(--color-soft)]">{line}</span>
        {/each}
      </div>
      <div class="flex flex-col gap-sm">
        <span class="label muted">Hours</span>
        <span class="fw-normal text-[var(--color-soft)]">{SITE.hours}</span>
      </div>
    </div>
  </div>
</div>

<style>
  .form-input {
    width: 100%; padding: 0.875rem var(--spacing-md);
    background: var(--color-off); border: 1px solid var(--color-rule);
    color: var(--color-ink); font-family: var(--font-sans);
    font-size: var(--text-base); font-variation-settings: var(--fw-normal);
    transition: border-color var(--duration-fast);
  }
  .form-input:focus { border-color: var(--color-ink); outline: none; }
  .form-input::placeholder { color: var(--color-mid); }
</style>