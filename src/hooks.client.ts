import * as Sentry from "@sentry/sveltekit";

const dsn = import.meta.env.PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE || "development",
    tracesSampleRate: 0.1,
  });
}

export const handleError = Sentry.handleErrorWithSentry();
