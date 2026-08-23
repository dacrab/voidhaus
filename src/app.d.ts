declare module "$env/dynamic/private" {
  export const env: {
    CONVEX_URL: string | undefined;
    CONVEX_SITE_URL: string | undefined;
    STRIPE_SECRET_KEY: string | undefined;
    STRIPE_WEBHOOK_SECRET: string | undefined;
    INTERNAL_WEBHOOK_SECRET: string | undefined;
  };
}
