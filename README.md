# VOIDHAUS

Dark luxury fashion. Twelve pieces. Four ateliers.

SvelteKit 3 + Svelte 5 storefront, prerendered to Vercel. The catalog is a static
module (`src/lib/data/products.ts`); Convex tracks per-size stock, orders,
coupons, and contact messages. Payments run through Stripe Checkout.

## Dev

```bash
bun install
bun dev        # wraps `vite dev` with Doppler-injected secrets
```

## Deploy

Push to `master` — Vercel builds and deploys automatically.

## Architecture

- **Storefront** — fully prerendered. Dynamic product pages use `entries()` so
  every catalog slug is generated at build time.
- **Catalog** — `src/lib/data/products.ts` is the source of truth for names,
  prices, sizes, images, and copy.
- **Stock** — Convex stores only `{ slug, sizeStock }`. Run `seedStock` with the
  deployment's `ADMIN_TOKEN` after changing the catalog (pass `reseed: true` to
  replace existing stock).
- **Sitemap** — generated at build time by `src/routes/sitemap.xml/+server.ts`.

## Backend surface (locked down)

- `orders.fulfill` is an **internal** Convex mutation. It is reachable only
  through the Stripe webhook pipeline: `/api/webhook` verifies the Stripe
  signature, then calls the Convex httpAction `POST /fulfill`, gated by a shared
  secret (`INTERNAL_WEBHOOK_SECRET`) known only to the server route.
- `seedStock` requires an admin token argument matching the Convex deployment's
  `ADMIN_TOKEN`.
- Public functions are limited to batched stock reads, coupon validation,
  contact-message creation, and order lookup by checkout-session id (a
  capability string shown only to the payer).

## Checkout

Checkout encodes `[slug, size, quantity, unitPrice]` tuples in the Stripe
session metadata, keeping the whole catalog within Stripe's 500-character
metadata limit. The webhook rebuilds names from the static catalog, verifies
the metadata total against both the line items and the amount Stripe charged,
then records the order.

## Coupon semantics

- **Percent** coupons reduce each merged cart line proportionally.
- **Fixed** coupons subtract once per order; the amount is allocated across
  lines by largest remainder so every line keeps at least €0.01.
- Discounts are applied by our own code (no Stripe coupon objects), and the
  stored order total always equals the amount Stripe charges.
- `maxUses` and expiry are re-checked when the webhook fulfills the order.

## Oversell handling

Stock is validated at session creation and re-checked atomically inside
fulfillment. If inventory ran out between the two, the order is recorded as
`failed` (not paid) and the shortfall is logged for a manual refund — Stripe
retries stop instead of looping forever.

## Rate limits

`/api/checkout`, `/api/contact`, and `/api/orders` are rate-limited per IP.
Upstash Redis REST is used when `UPSTASH_REDIS_REST_URL` and
`UPSTASH_REDIS_REST_TOKEN` are set; otherwise an in-memory per-instance window
is used. Store failures fail open with a single warning.

## Config

- **Catalog** → `src/lib/data/products.ts`
- **Contact info** → `src/lib/data/site.ts`
- **Colours & type** → CSS custom properties in `src/app.css`

### Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `CONVEX_URL` | SvelteKit server | Convex client for API routes |
| `CONVEX_SITE_URL` | SvelteKit server | Convex HTTP actions host (`*.convex.site`) |
| `STRIPE_SECRET_KEY` | SvelteKit server | Checkout sessions and webhook verification |
| `STRIPE_WEBHOOK_SECRET` | SvelteKit server | Webhook signature verification |
| `INTERNAL_WEBHOOK_SECRET` | SvelteKit server **and** Convex | Shared secret for `/fulfill` |
| `ADMIN_TOKEN` | Convex | Authorizes `seedStock` |
| `RESEND_API_KEY` | Convex | Order confirmation emails (optional) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | SvelteKit server | Optional shared rate-limit store |
| `PUBLIC_SENTRY_DSN` | Client | Browser error reporting (optional) |
| `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` | Build | Source-map upload (optional) |

Secrets are injected locally with Doppler (`doppler run --`). See
`.env.example` for the full list.
