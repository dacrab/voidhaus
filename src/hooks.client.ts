import * as Sentry from "@sentry/sveltekit";
import { dev } from "$app/env";
import { PUBLIC_SENTRY_DSN } from "$app/env/public";

if (PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: PUBLIC_SENTRY_DSN,
    environment: dev ? "development" : "production",
    tracesSampleRate: 0.1,
  });
}

export const handleError = Sentry.handleErrorWithSentry();
