import * as Sentry from "@sentry/sveltekit";
import { dev } from "$app/env";
import { SENTRY_DSN } from "$app/env/private";

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: dev ? "development" : "production",
    tracesSampleRate: 0.1,
  });
}

export const handle = Sentry.sentryHandle();

export const handleError = Sentry.handleErrorWithSentry();
