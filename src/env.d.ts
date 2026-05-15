/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly CONVEX_URL: string;
  readonly PUBLIC_CONVEX_URL: string;
  readonly STRIPE_SECRET_KEY: string;
  readonly STRIPE_WEBHOOK_SECRET: string;
  readonly ADMIN_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
