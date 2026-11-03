# VOIDHAUS

Twelve objects for the body and the room.

**Live demo:** https://voidhaus.vercel.app

A dark luxury storefront, kept deliberately small. Outerwear, knitwear, accessories and objects come from four ateliers — Milan, Antwerp, Florence, Tokyo — and every piece gets a proper page with sizes, materials and care notes. Put things in a bag, pay in euros through Stripe, then return to the order page whenever you like. There's a lookbook and a stockist list for browsing, and a contact form that lands with the studio.

## In the store

- Six categories, a dozen or so pieces, no infinite scroll
- Size-by-size availability pulled live, so a sold-out size is visibly sold out
- Coupons with usage caps and expiry dates
- An order page you can reopen later from its own link
- Lookbook, atelier, stockists, privacy and terms pages
- A contact form that saves the message and pings the studio

## Running it

Bun, a Convex deployment, and Stripe test keys.

```bash
bun install
doppler setup        # or copy .env.example to .env and fill it in
bunx convex dev      # backend
bun dev              # storefront
```

The `dev` script wraps Vite in `doppler run`, so skip Doppler and use `bunx vite dev` if your keys live in `.env` instead.

## Things that bite

- Stock is re-checked at order confirmation. If the last one sold while someone was paying, the order is marked failed rather than paid, and logged for a manual refund — cheap, but honest.
- Totals are recalculated server-side from the catalog, so a tampered cart doesn't get through.
- Order confirmation emails need Resend with a verified domain. Without one, orders and messages are still stored; the email is simply skipped.
- Locally, keep Stripe in test mode and use its test cards.

SvelteKit and Svelte, Convex, Stripe, Tailwind CSS, on Vercel. MIT.
