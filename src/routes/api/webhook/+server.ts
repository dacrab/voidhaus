import { json } from "@sveltejs/kit";
import type Stripe from "stripe";
import { api } from "$convex/api";
import type { Id } from "$convex/dataModel";
import { getConvex, getStripe } from "$lib/utils/api";
import type { RequestHandler } from "./$types";

export const prerender = false;

interface OrderItem {
  productId: Id<"products">;
  slug: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
}

export const POST: RequestHandler = async ({ request }) => {
  const stripe = getStripe();
  const convex = getConvex();
  const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return new Response("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

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

    const couponId = session.metadata?.couponId;
    if (couponId) {
      await convex.mutation(api.coupons.use, { id: couponId as Id<"coupons"> });
    }

    await convex.mutation(api.orders.fulfill, {
      stripeSessionId: session.id,
      stripePaymentIntentId: (session.payment_intent as string) ?? "",
      customerEmail: customerDetails?.email ?? undefined,
      shippingAddress,
    });
  }

  return json({ received: true }, { status: 200 });
};
