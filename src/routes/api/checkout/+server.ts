import { captureException } from "@sentry/sveltekit";
import type Stripe from "stripe";
import { z } from "zod";
import { api } from "#convex/api.js";
import { getProduct } from "#lib/data/products.js";
import { encodeOrderItems, STRIPE_METADATA_MAX } from "#lib/server/checkout-metadata.js";
import { applyDiscount } from "#lib/server/pricing.js";
import { isRateLimited } from "#lib/server/rate-limit.js";
import { getConvex, getStripe } from "#lib/utils/api.js";
import type { CheckoutOrderItem } from "#lib/utils/schemas.js";
import type { RequestHandler } from "./$types";

export const prerender = false;

const CheckoutItemSchema = z.object({
  slug: z.string().min(1),
  size: z.string().min(1),
});

const CheckoutBodySchema = z.object({
  items: z.array(CheckoutItemSchema).min(1),
  couponCode: z.string().trim().min(1).optional(),
});

const SHIPPING_COUNTRIES = [
  "US",
  "GB",
  "DE",
  "FR",
  "IT",
  "ES",
  "NL",
  "BE",
  "AT",
  "CH",
  "SE",
  "DK",
  "NO",
  "JP",
  "AU",
  "CA",
] as const;

type BuildResult = { items: CheckoutOrderItem[] } | { error: string };

async function buildOrderItems(
  convex: ReturnType<typeof getConvex>,
  items: Array<{ slug: string; size: string }>,
): Promise<BuildResult> {
  const merged = new Map<string, { slug: string; size: string; quantity: number }>();
  for (const { slug, size } of items) {
    const key = `${slug}|${size}`;
    const existing = merged.get(key);
    if (existing) existing.quantity += 1;
    else merged.set(key, { slug, size, quantity: 1 });
  }

  const slugs = [...new Set([...merged.values()].map((item) => item.slug))];
  const stocks = await convex.query(api.products.getStockBySlugs, { slugs });

  const orderItems: CheckoutOrderItem[] = [];
  for (const { slug, size, quantity } of merged.values()) {
    const product = getProduct(slug);
    if (!product) return { error: `Unknown product: ${slug}` };
    if (!product.sizes.includes(size)) return { error: `Invalid size for ${product.name}: ${size}` };

    if ((stocks[slug]?.[size] ?? 0) < quantity) {
      return { error: `Insufficient stock for ${product.name} (size ${size})` };
    }

    orderItems.push({ slug, name: product.name, price: product.price, size, quantity });
  }

  if (!orderItems.length) return { error: "No valid items" };
  return { items: orderItems };
}

type CouponResult =
  | { ok: true; couponId?: string; items: CheckoutOrderItem[]; total: number }
  | { ok: false; error: string };

async function applyCoupon(
  convex: ReturnType<typeof getConvex>,
  couponCode: string,
  orderItems: CheckoutOrderItem[],
): Promise<CouponResult> {
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const result = await convex.query(api.coupons.validate, { code: couponCode, orderTotal: subtotal });
  if (!result.valid) return { ok: false, error: result.error ?? "Invalid coupon" };

  const discounted = applyDiscount(
    orderItems,
    result.type === "percent" ? result.value : null,
    result.type === "fixed" ? result.value : null,
  );

  return {
    ok: true,
    ...(result.couponId ? { couponId: result.couponId } : {}),
    items: discounted.items,
    total: discounted.total,
  };
}

function toLineItems(orderItems: CheckoutOrderItem[]): NonNullable<Stripe.Checkout.SessionCreateParams["line_items"]> {
  return orderItems.map((item) => ({
    price_data: {
      currency: "eur",
      product_data: {
        name: item.name,
        description: `Size ${item.size}`,
        metadata: { slug: item.slug },
      },
      unit_amount: item.price * 100,
    },
    quantity: item.quantity,
  }));
}

export const POST: RequestHandler = async ({ request, url }) => {
  if (await isRateLimited(request, "checkout", 10)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  const stripe = getStripe();
  const convex = getConvex();

  try {
    const parsed = CheckoutBodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }

    const built = await buildOrderItems(convex, parsed.data.items);
    if ("error" in built) {
      return Response.json({ error: built.error }, { status: 400 });
    }

    let orderItems = built.items;
    let total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let couponId: string | undefined;

    if (parsed.data.couponCode) {
      const coupon = await applyCoupon(convex, parsed.data.couponCode, orderItems);
      if (!coupon.ok) {
        return Response.json({ error: coupon.error }, { status: 400 });
      }
      couponId = coupon.couponId;
      orderItems = coupon.items;
      total = coupon.total;
    }

    const encodedItems = encodeOrderItems(orderItems);
    if (encodedItems.length > STRIPE_METADATA_MAX) {
      return Response.json({ error: "Order is too large for checkout" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: toLineItems(orderItems),
      shipping_address_collection: { allowed_countries: [...SHIPPING_COUNTRIES] },
      success_url: `${url.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${url.origin}/checkout/cancel`,
      metadata: {
        items: encodedItems,
        total: String(total),
        couponId: couponId ?? "",
      },
    });

    if (!session.url) throw new Error("Stripe did not return a checkout URL");

    return Response.json({ url: session.url }, { status: 200 });
  } catch (error) {
    captureException(error);
    return Response.json({ error: "Checkout failed" }, { status: 500 });
  }
};
