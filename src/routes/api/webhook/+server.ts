import { captureException } from "@sentry/sveltekit";
import type Stripe from "stripe";
import { z } from "zod";
import { getStripe } from "#lib/utils/api.js";
import { CONVEX_SITE_URL, INTERNAL_WEBHOOK_SECRET, STRIPE_WEBHOOK_SECRET } from "$app/env/private";
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

// Extracted from the Stripe session in the shape the orders schema stores.
function parseShippingAddress(session: Stripe.Checkout.Session): z.infer<typeof ShippingAddressSchema> | undefined {
  const shipping = session.collected_information?.shipping_details?.address;
  if (!shipping) return undefined;
  const details = session.collected_information?.shipping_details;
  return ShippingAddressSchema.parse({
    name: details?.name ?? "",
    line1: shipping.line1 ?? "",
    line2: shipping.line2 ?? undefined,
    city: shipping.city ?? "",
    state: shipping.state ?? undefined,
    postalCode: shipping.postal_code ?? "",
    country: shipping.country ?? "",
  });
}

export const POST: RequestHandler = async ({ request }) => {
  const stripe = getStripe();
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!(sig && STRIPE_WEBHOOK_SECRET)) {
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
  } catch {
    return new Response("Webhook Error: Invalid signature", { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return Response.json({ received: true }, { status: 200 });
  }

  try {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerDetails = session.customer_details;

    // Permanent configuration problem — retries cannot fix it.
    if (!customerDetails?.email) {
      // biome-ignore lint/suspicious/noConsole: webhook rejections belong in server logs
      console.error("Webhook rejected: checkout session has no customer email", session.id);
      return new Response("Missing customer email", { status: 400 });
    }

    const shippingAddress = parseShippingAddress(session);

    const orderItems = z.array(OrderItemSchema).parse(JSON.parse(session.metadata?.orderItems ?? "[]"));
    // Total is computed at checkout from the same discounted line items and
    // stored in metadata so the recorded amount always matches what was charged.
    const total = z.coerce
      .number()
      .nonnegative()
      .parse(session.metadata?.total ?? NaN);

    const couponId = session.metadata?.couponId || undefined;

    const response = await fetch(`${CONVEX_SITE_URL}/fulfill`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": INTERNAL_WEBHOOK_SECRET ?? "",
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
    // biome-ignore lint/suspicious/noConsole: webhook failures belong in server logs
    console.error("Webhook processing failed:", err);
    captureException(err);
    return Response.json({ error: "Failed to process webhook" }, { status: 500 });
  }

  return Response.json({ received: true }, { status: 200 });
};
