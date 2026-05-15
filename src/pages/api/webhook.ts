export const prerender = false;

import type { APIRoute } from "astro";
import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);
const convex = new ConvexHttpClient(import.meta.env.CONVEX_URL);
const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return new Response("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const shipping = session.shipping_details?.address;

    await convex.mutation(api.orders.fulfill, {
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent as string,
      customerEmail: session.customer_details?.email ?? undefined,
      shippingAddress: shipping
        ? {
            name: session.shipping_details?.name ?? "",
            line1: shipping.line1 ?? "",
            line2: shipping.line2 ?? undefined,
            city: shipping.city ?? "",
            state: shipping.state ?? undefined,
            postalCode: shipping.postal_code ?? "",
            country: shipping.country ?? "",
          }
        : undefined,
    });
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
};
