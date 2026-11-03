# VOIDHAUS

A dark luxury fashion storefront — twelve objects for the body and the room.

**Live demo:** https://voidhaus.vercel.app

Browse a small catalog of outerwear, knitwear, accessories and objects made by four ateliers in Milan, Antwerp, Florence and Tokyo. Each piece has its own page with sizes, materials and studio details. Pick a size, add it to your bag, and pay with Stripe Checkout. There is also a lookbook, a stockist list, and a contact form that reaches the studio.

## Features

- A tight catalog split across outerwear, body, tops, ready-to-wear, accessories and objects
- Product pages with size availability, materials, and care notes
- A shopping bag and Stripe checkout in euros
- Coupon codes, with usage limits and expiry
- An order link you can revisit after paying
- Lookbook, atelier and stockist pages
- A contact form that saves your message and notifies the studio

## Run it locally

You'll need [Bun](https://bun.sh), a Convex deployment, and Stripe test keys.

```bash
bun install
doppler setup        # link secrets, or copy .env.example to .env and fill it in
bunx convex dev      # start the backend
bun dev              # start the storefront
```

Secrets are normally injected with Doppler; `bun dev` assumes it is set up. Without Doppler, run `bunx vite dev` and keep your keys in `.env`.

## Good to know

- Checkout needs Stripe keys. Use test keys and Stripe's test cards locally.
- Sizes are tracked per piece and checked again when an order is confirmed, so two people can't buy the last one.
- If stock runs out between paying and confirmation, the order is recorded as failed and flagged for a refund.
- Email confirmations are optional. Without a verified sending domain, orders and messages are still saved.

## Built with

SvelteKit, Svelte, Convex, Stripe, and Tailwind CSS. Hosted on Vercel.

## License

MIT
