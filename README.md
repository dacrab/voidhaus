# VOIDHAUS

Dark luxury fashion. Twelve pieces. Four ateliers.

SvelteKit 2 + Svelte 5 storefront, prerendered to Vercel. The catalog is a static
module (`src/lib/data/products.ts`); Convex tracks per-size stock, orders,
coupons, and contact messages. Payments run through Stripe Checkout.

## Dev

```bash
bun install
bun dev        # wraps `vite dev` with Doppler-injected secrets
```

## Deploy

Push to `master` — Vercel builds and deploys automatically.

## Backend surface (locked down)

- `orders.create` / `orders.fulfill` are **internal** Convex mutations. They are
  reachable only through the Stripe webhook pipeline: `/api/webhook` verifies the
  Stripe signature, then calls the Convex httpAction `POST /fulfill`, which is
  gated by a shared secret (`INTERNAL_WEBHOOK_SECRET`) known only to the server
  route.
- Seed mutations (`seedProducts`) require an admin token
  argument matching the Convex deployment's `ADMIN_TOKEN`.
- Public functions are limited to what the storefront needs: batched stock
  reads, coupon validation, contact-message creation, and order lookup by
  checkout-session id (a capability string shown only to the payer).

## Coupon semantics

- **Percent** coupons reduce each merged cart line proportionally.
- **Fixed** coupons subtract once per order; the amount is allocated across
  lines by largest remainder so every line keeps at least €0.01.
- Discounts are applied at checkout by our own code (no Stripe coupon objects),
  and the stored order total always equals the amount Stripe charges.
- `maxUses`/expiry are re-checked when the webhook fulfills the order.

## Oversell handling

Stock is validated at session creation and re-checked atomically inside
fulfillment. If inventory ran out between the two, the order is marked
`failed` (not paid) and the shortfall is logged for a manual refund — Stripe
retries stop instead of looping forever.

## Rate limits

Private endpoints (`/api/checkout`, `/api/contact`, `/api/orders`) are
rate-limited per IP. Backed by Upstash Redis REST when
`UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` are set; otherwise an
in-memory per-instance window. Store failures fail open (warns once).

## Config

- **Catalog** → `src/lib/data/products.ts` (source of truth; mirror stock into
  Convex via `seedProducts`)
- **Contact info** → `src/lib/data/site.ts`
- **Colours & type** → CSS custom properties in `src/app.css`

### Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `CONVEX_URL` | SvelteKit server | Convex client for API routes |
| `CONVEX_SITE_URL` | SvelteKit server | Convex HTTP actions host (`*.convex.site`), used by the webhook |
| `STRIPE_SECRET_KEY` | SvelteKit server | Checkout sessions, webhook signature verification |
| `STRIPE_WEBHOOK_SECRET` | SvelteKit server | Webhook signature verification |
| `INTERNAL_WEBHOOK_SECRET` | SvelteKit server **and** Convex | Shared secret between `/api/webhook` and Convex `/fulfill` |
| `ADMIN_TOKEN` | Convex | Authorizes seed mutations |
| `RESEND_API_KEY` | Convex | Order confirmation emails (optional; skipped if unset) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | SvelteKit server | Optional shared rate-limit store |
| `PUBLIC_SENTRY_DSN` | Client | Browser error reporting (optional) |
| `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` | Build | Source-map upload (optional) |

Secrets are injected locally with Doppler (`doppler run --`). See
`.env.example` for the full list.
