import { defineEnvVars } from "@sveltejs/kit/env";

// These keep the previous `$env/dynamic/*` behaviour: missing values fall back to an empty string.
export const variables = defineEnvVars({
  STRIPE_WEBHOOK_SECRET: { schema: (input) => input ?? "" },
  CONVEX_SITE_URL: { schema: (input) => input ?? "" },
  INTERNAL_WEBHOOK_SECRET: { schema: (input) => input ?? "" },
  CONVEX_URL: { schema: (input) => input ?? "" },
  STRIPE_SECRET_KEY: { schema: (input) => input ?? "" },
});
