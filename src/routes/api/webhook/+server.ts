import { captureException } from "@sentry/sveltekit";
import { json } from "@sveltejs/kit";
import type Stripe from "stripe";
import { z } from "zod";
import { env } from "$env/dynamic/private";
import { getStripe } from "$lib/utils/api";
import type { RequestHandler } from "./$types";

export const prerender = false;

const ShippingAddressSchema = z.object({
  name: z.string(),
  line1: z.string(),
  line2: z.string().optional(),
  city: z.string(),
  state: z.string().optional(),
  postalCode: z.string(),
  country: z.string(),
});

const OrderItemSchema = z.object({
  productId: z.string(),
  slug: z.string(),
  name: z.string(),
  price: z.number(),
  size: z.string(),
  quantity: z.number().int().min(1),
});

export const POST: RequestHandler = async ({ request }) => {
  const stripe = getStripe();
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!(sig && env.STRIPE_WEBHOOK_SECRET)) {
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return new Response("Webhook Error: Invalid signature", { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return json({ received: true }, { status: 200 });
  }

  try {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerDetails = session.customer_details;
    const shippingDetails = session.collected_information?.shipping_details;

    // Permanent configuration problem — retries cannot fix it.
    if (!customerDetails?.email) {
      console.error("Webhook rejected: checkout session has no customer email", session.id);
      return new Response("Missing customer email", { status: 400 });
    }

    const shipping = shippingDetails?.address;
    const shippingAddress = shipping
      ? ShippingAddressSchema.parse({
          name: shippingDetails?.name ?? "",
          line1: shipping.line1 ?? "",
          line2: shipping.line2 ?? undefined,
          city: shipping.city ?? "",
          state: shipping.state ?? undefined,
          postalCode: shipping.postal_code ?? "",
          country: shipping.country ?? "",
        })
      : undefined;

    const orderItems = z.array(OrderItemSchema).parse(JSON.parse(session.metadata?.orderItems ?? "[]"));
    // Total is computed at checkout from the same discounted line items and
    // stored in metadata so the recorded amount always matches what was charged.
    const total = z.coerce
      .number()
      .nonnegative()
      .parse(session.metadata?.total ?? NaN);

    const couponId = session.metadata?.couponId || undefined;

    const response = await fetch(`${env.CONVEX_SITE_URL}/fulfill`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": env.INTERNAL_WEBHOOK_SECRET ?? "",
      },
      body: JSON.stringify({
        sessionId: session.id,
        paymentIntentId: String(session.payment_intent ?? ""),
        customerEmail: customerDetails.email,
        couponId,
        items: orderItems,
        total,
        shippingAddress,
      }),
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Convex fulfillment failed (${response.status}): ${detail}`);
    }
  } catch (err) {
    console.error("Webhook processing failed:", err);
    captureException(err);
    return json({ error: "Failed to process webhook" }, { status: 500 });
  }

  return json({ received: true }, { status: 200 });
};
