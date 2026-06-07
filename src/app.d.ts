declare module '$env/static/private' {
  export const CONVEX_URL: string;
  export const STRIPE_SECRET_KEY: string;
  export const STRIPE_WEBHOOK_SECRET: string;
}

declare module '$env/dynamic/private' {
  export const env: {
    CONVEX_URL: string | undefined;
    STRIPE_SECRET_KEY: string | undefined;
    STRIPE_WEBHOOK_SECRET: string | undefined;
  };
}
