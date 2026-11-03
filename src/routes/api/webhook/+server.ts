import { captureException } from "@sentry/sveltekit";
import type Stripe from "stripe";
import { z } from "zod";
import { getProduct } from "#lib/data/products.js";
import { decodeOrderItems } from "#lib/server/checkout-metadata.js";
import { getStripe } from "#lib/utils/api.js";
import type { CheckoutOrderItem } from "#lib/utils/schemas.js";
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

function parseShippingAddress(session: Stripe.Checkout.Session): z.infer<typeof ShippingAddressSchema> | undefined {
  const details = session.collected_information?.shipping_details;
  if (!details?.address) return undefined;

  return ShippingAddressSchema.parse({
    name: details.name ?? "",
    line1: details.address.line1 ?? "",
    line2: details.address.line2 ?? undefined,
    city: details.address.city ?? "",
    state: details.address.state ?? undefined,
    postalCode: details.address.postal_code ?? "",
    country: details.address.country ?? "",
  });
}

function verifyTotals(session: Stripe.Checkout.Session, items: CheckoutOrderItem[], total: number): number {
  const itemsTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (itemsTotal !== total) {
    throw new Error(`Order metadata total ${total} does not match items total ${itemsTotal}`);
  }
  if (session.amount_total !== total * 100) {
    throw new Error(`Stripe charged ${session.amount_total}, expected ${total * 100}`);
  }
  if (session.currency !== "eur") {
    throw new Error(`Unexpected checkout currency: ${session.currency}`);
  }

  const baseTotal = items.reduce((sum, item) => {
    const product = getProduct(item.slug);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
  if (total > baseTotal) {
    throw new Error(`Discounted total ${total} exceeds catalog total ${baseTotal}`);
  }

  return baseTotal;
}

async function fulfillSession(session: Stripe.Checkout.Session, customerEmail: string): Promise<void> {
  const items = decodeOrderItems(session.metadata?.items ?? "[]");
  const total = z.coerce.number().int().nonnegative().parse(session.metadata?.total);
  const baseTotal = verifyTotals(session, items, total);

  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? "");

  const response = await fetch(`${CONVEX_SITE_URL}/fulfill`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": INTERNAL_WEBHOOK_SECRET ?? "",
    },
    body: JSON.stringify({
      sessionId: session.id,
      paymentIntentId,
      customerEmail,
      couponId: session.metadata?.couponId || undefined,
      items,
      total,
      discount: Math.max(0, baseTotal - total),
      shippingAddress: parseShippingAddress(session),
    }),
  });

  if (!response.ok) {
    throw new Error(`Convex fulfillment failed (${response.status}): ${await response.text()}`);
  }
}

export const POST: RequestHandler = async ({ request }) => {
  const signature = request.headers.get("stripe-signature");
  if (!(signature && STRIPE_WEBHOOK_SECRET)) {
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, STRIPE_WEBHOOK_SECRET);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const isPaidCheckout =
    event.type === "checkout.session.completed" &&
    (event.data.object as Stripe.Checkout.Session).payment_status === "paid";
  const isAsyncPaymentSucceeded = event.type === "checkout.session.async_payment_succeeded";

  if (!(isPaidCheckout || isAsyncPaymentSucceeded)) {
    return Response.json({ received: true }, { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const customerEmail = session.customer_details?.email;
  if (!customerEmail) {
    // A permanent configuration problem — retries cannot fix it.
    return new Response("Missing customer email", { status: 400 });
  }

  try {
    await fulfillSession(session, customerEmail);
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: webhook failures belong in server logs
    console.error("Webhook processing failed:", error);
    captureException(error);
    return Response.json({ error: "Failed to process webhook" }, { status: 500 });
  }

  return Response.json({ received: true }, { status: 200 });
};
