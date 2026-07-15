import { json } from "@sveltejs/kit";
import type Stripe from "stripe";
import { api } from "$convex/api";
import type { Id } from "$convex/dataModel";
import { env } from "$env/dynamic/private";
import { getConvex, getStripe, type OrderItem, toError } from "$lib/utils/api";
import type { RequestHandler } from "./$types";

export const prerender = false;

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
  } catch (err: unknown) {
    return new Response(`Webhook Error: ${toError(err)}`, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerDetails = session.customer_details;
      const shippingDetails = session.collected_information?.shipping_details;

      const shipping = shippingDetails?.address;
      const shippingAddress = shipping
        ? {
            name: shippingDetails?.name ?? "",
            line1: shipping.line1 ?? "",
            line2: shipping.line2 ?? undefined,
            city: shipping.city ?? "",
            state: shipping.state ?? undefined,
            postalCode: shipping.postal_code ?? "",
            country: shipping.country ?? "",
          }
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

      const couponId: Id<"coupons"> | undefined = session.metadata?.couponId
        ? (session.metadata.couponId as Id<"coupons">)
        : undefined;
      if (couponId) {
        await convex.mutation(api.coupons.use, { id: couponId });
      }

      await convex.mutation(api.orders.fulfill, {
        stripeSessionId: session.id,
        stripePaymentIntentId: String(session.payment_intent ?? ""),
        customerEmail: customerDetails?.email ?? undefined,
        shippingAddress,
      });
    }
  } catch (err: unknown) {
    return json({ error: toError(err) }, { status: 500 });
  }

  return json({ received: true }, { status: 200 });
};
