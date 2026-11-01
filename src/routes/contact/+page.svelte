<script lang="ts">
  import PageHeader from "#lib/components/PageHeader.svelte";
  import { LIMITS } from "#lib/data/limits.js";
  import { SITE } from "#lib/data/site.js";

  let name = $state("");
  let email = $state("");
  let message = $state("");
  let sent = $state(false);
  let error = $state("");
  let submitting = $state(false);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (submitting) return;

    error = "";
    submitting = true;
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (response.ok) {
        sent = true;
        name = "";
        email = "";
        message = "";
      } else {
        error = "Something went wrong. Please try again.";
      }
    } catch {
      error = "Network error. Please try again.";
    } finally {
      submitting = false;
    }
  }
</script>

<svelte:head>
  <title>Contact — VOIDHAUS</title>
</svelte:head>

<PageHeader label="Contact" title="Inquiries" />

<div class="wrap">
  <div class="grid gap-2xl md:grid-cols-2 md:gap-4xl py-2xl md:py-3xl" data-stagger>
    <div class="flex flex-col gap-xl">
      {#if sent}
        <div class="flex flex-col gap-sm">
          <span class="label fw-medium">Message received</span>
          <p class="text-soft leading-[1.85]">
            The studio will respond within two business days.
          </p>
        </div>
      {:else}
        <form class="flex flex-col gap-lg" onsubmit={handleSubmit}>
          <div class="flex flex-col gap-sm">
            <label class="label muted" for="contact-name">Name</label>
            <input
              id="contact-name"
              type="text"
              bind:value={name}
              required
              maxlength={LIMITS.nameMax}
              class="field"
              autocomplete="name"
            />
          </div>
          <div class="flex flex-col gap-sm">
            <label class="label muted" for="contact-email">Email</label>
            <input
              id="contact-email"
              type="email"
              bind:value={email}
              required
              maxlength={LIMITS.emailMax}
              class="field"
              autocomplete="email"
            />
          </div>
          <div class="flex flex-col gap-sm">
            <label class="label muted" for="contact-message">Message</label>
            <textarea
              id="contact-message"
              bind:value={message}
              required
              rows="5"
              maxlength={LIMITS.messageMax}
              class="field min-h-[10rem]"
            ></textarea>
          </div>
          {#if error}
            <p class="form-error label" role="alert">{error}</p>
          {/if}
          <button type="submit" class="btn-outline justify-center max-w-[16rem]" disabled={submitting}>
            <span class="label">{submitting ? "Sending…" : "Send"}</span>
          </button>
        </form>
      {/if}
    </div>

    <div class="flex flex-col gap-xl">
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
        {#each SITE.address as line (line)}
          <span class="fw-normal text-soft">{line}</span>
        {/each}
      </div>
      <div class="flex flex-col gap-sm">
        <span class="label muted">Hours</span>
        <span class="fw-normal text-soft">{SITE.hours}</span>
      </div>
    </div>
  </div>
</div>

<style>
  .form-error { color: var(--color-error); }
</style>
