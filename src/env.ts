import { defineEnvVars } from "@sveltejs/kit/env";

const optional = (value: string | undefined) => value || undefined;

// One documented fallback so local builds and previews work without a full
// environment. Production sets PUBLIC_SITE_URL to the canonical origin.
const DEFAULT_SITE_URL = "https://voidhaus.vercel.app";

const siteOrigin = (value: string | undefined) => {
  try {
    return new URL(value?.trim() || DEFAULT_SITE_URL).origin;
  } catch {
    throw new Error("PUBLIC_SITE_URL must be an absolute URL, e.g. https://example.com");
  }
};

export const variables = defineEnvVars({
  PUBLIC_SITE_URL: {
    public: true,
    static: true,
    description: "Canonical origin used for canonical links, sitemap, robots and social images",
    schema: siteOrigin,
  },
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
  SENTRY_DSN: {
    description: "Optional Sentry DSN for server error reporting",
    schema: optional,
  },
});
