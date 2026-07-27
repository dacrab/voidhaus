import { json } from "@sveltejs/kit";
import type Stripe from "stripe";
import { z } from "zod";
import { api } from "$convex/api";
import type { Id } from "$convex/dataModel";
import { env } from "$env/dynamic/private";
import { getConvex, getStripe, type OrderItem } from "$lib/utils/api";
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

export const POST: RequestHandler = async ({ request }) => {
  const stripe = getStripe();
  const convex = getConvex();
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig || !webhookSecret) {
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
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

    const orderItems: OrderItem[] = JSON.parse(session.metadata?.orderItems ?? "[]");
    const total = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);

    await convex.mutation(api.orders.create, {
      stripeSessionId: session.id,
      customerEmail: customerDetails?.email ?? "",
      items: orderItems,
      total,
      currency: "eur",
    });

    const rawCouponId = session.metadata?.couponId;
    if (rawCouponId) {
      await convex.mutation(api.coupons.use, { id: rawCouponId as Id<"coupons"> });
    }

    await convex.mutation(api.orders.fulfill, {
      stripeSessionId: session.id,
      stripePaymentIntentId: String(session.payment_intent ?? ""),
      customerEmail: customerDetails?.email ?? undefined,
      shippingAddress,
    });
  } catch {
    return json({ error: "Failed to process webhook" }, { status: 500 });
  }

  return json({ received: true }, { status: 200 });
};
