import * as Sentry from "@sentry/sveltekit";
import type { HandleClientError } from "@sveltejs/kit";
import { PUBLIC_SENTRY_DSN } from "$env/static/public";

if (PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: PUBLIC_SENTRY_DSN,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
    tracesSampleRate: 0.1,
  });
}

export const handleError = Sentry.handleErrorWithSentry() satisfies HandleClientError;
