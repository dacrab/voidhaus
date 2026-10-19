import { sveltekit } from '@sveltejs/kit/vite';
import { sentrySvelteKit } from '@sentry/sveltekit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const hasSentryCredentials = Boolean(
  process.env.SENTRY_AUTH_TOKEN &&
    process.env.SENTRY_ORG &&
    process.env.SENTRY_PROJECT,
);

const sentryOptions = {
  autoUploadSourceMaps: hasSentryCredentials,
  telemetry: hasSentryCredentials,
};

export default defineConfig({
  plugins: [
    sentrySvelteKit(sentryOptions),
    tailwindcss(),
    sveltekit(),
  ],
});