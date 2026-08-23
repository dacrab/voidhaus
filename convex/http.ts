import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { httpAction } from "./_generated/server";

interface FulfillPayload {
  sessionId: string;
  paymentIntentId: string;
  customerEmail?: string;
  couponId?: Id<"coupons">;
  items: Array<{
    productId: Id<"products">;
    slug: string;
    name: string;
    price: number;
    size: string;
    quantity: number;
  }>;
  total: number;
  discount?: number;
  shippingAddress?: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
}

function isFulfillPayload(body: unknown): body is FulfillPayload {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.sessionId === "string" &&
    typeof b.paymentIntentId === "string" &&
    typeof b.total === "number" &&
    Array.isArray(b.items) &&
    b.items.length > 0 &&
    (b.customerEmail === undefined || typeof b.customerEmail === "string") &&
    (b.couponId === undefined || typeof b.couponId === "string") &&
    (b.discount === undefined || typeof b.discount === "number") &&
    (b.shippingAddress === undefined || typeof b.shippingAddress === "object")
  );
}

// Called only by our own server route (api/webhook) AFTER it has verified the
// Stripe signature there. This shared-secret gate keeps order writes unreachable
// from the public Convex API surface.
const fulfill = httpAction(async (ctx, request) => {
  const secret = process.env.INTERNAL_WEBHOOK_SECRET;
  const provided = request.headers.get("x-internal-secret");
  if (!(secret && provided) || provided !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  if (!isFulfillPayload(body)) {
    return new Response("Invalid payload", { status: 400 });
  }

  await ctx.runMutation(internal.orders.create, {
    stripeSessionId: body.sessionId,
    customerEmail: body.customerEmail ?? "",
    items: body.items,
    total: body.total,
    discount: body.discount,
    currency: "eur",
  });

  await ctx.runMutation(internal.orders.fulfill, {
    stripeSessionId: body.sessionId,
    stripePaymentIntentId: body.paymentIntentId,
    customerEmail: body.customerEmail,
    couponId: body.couponId,
    shippingAddress: body.shippingAddress,
  });

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

const http = httpRouter();

http.route({ path: "/fulfill", method: "POST", handler: fulfill });

export default http;
