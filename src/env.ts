import { defineEnvVars } from "@sveltejs/kit/env";

const optional = (value: string | undefined) => value || undefined;

export const variables = defineEnvVars({
  CONVEX_URL: {
    description: "Convex deployment URL used by server-side API routes",
    schema: optional,
  },
  CONVEX_SITE_URL: {
    description: "Convex HTTP actions host (*.convex.site) used by the Stripe webhook",
    schema: optional,
  },
  STRIPE_SECRET_KEY: {
    description: "Stripe secret key",
    schema: optional,
  },
  STRIPE_WEBHOOK_SECRET: {
    description: "Stripe webhook signing secret",
    schema: optional,
  },
  INTERNAL_WEBHOOK_SECRET: {
    description: "Shared secret between the webhook route and Convex /fulfill",
    schema: optional,
  },
  PUBLIC_SENTRY_DSN: {
    public: true,
    description: "Optional Sentry DSN for browser error reporting",
    schema: optional,
  },
});
