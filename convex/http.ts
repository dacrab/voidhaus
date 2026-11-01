import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { httpAction } from "./_generated/server";

interface FulfillPayload {
  sessionId: string;
  paymentIntentId: string;
  customerEmail: string;
  couponId?: Id<"coupons">;
  items: Array<{
    slug: string;
    name: string;
    price: number;
    size: string;
    quantity: number;
  }>;
  total: number;
  discount: number;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isOrderItem(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    typeof value.slug === "string" &&
    typeof value.name === "string" &&
    typeof value.price === "number" &&
    typeof value.size === "string" &&
    typeof value.quantity === "number"
  );
}

function isFulfillPayload(body: unknown): body is FulfillPayload {
  if (!isRecord(body)) return false;

  return (
    typeof body.sessionId === "string" &&
    typeof body.paymentIntentId === "string" &&
    typeof body.customerEmail === "string" &&
    typeof body.total === "number" &&
    typeof body.discount === "number" &&
    Array.isArray(body.items) &&
    body.items.length > 0 &&
    body.items.every(isOrderItem) &&
    (body.couponId === undefined || typeof body.couponId === "string") &&
    (body.shippingAddress === undefined || isRecord(body.shippingAddress))
  );
}

// Called only by our own server route (/api/webhook) after it has verified the
// Stripe signature. This shared-secret gate keeps order writes unreachable from
// the public Convex API surface.
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

  await ctx.runMutation(internal.orders.fulfill, {
    stripeSessionId: body.sessionId,
    stripePaymentIntentId: body.paymentIntentId,
    customerEmail: body.customerEmail,
    items: body.items,
    total: body.total,
    discount: body.discount,
    ...(body.couponId ? { couponId: body.couponId } : {}),
    ...(body.shippingAddress ? { shippingAddress: body.shippingAddress } : {}),
  });

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

const http = httpRouter();

http.route({ path: "/fulfill", method: "POST", handler: fulfill });

export default http;
