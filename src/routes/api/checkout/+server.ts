import { captureException } from "@sentry/sveltekit";
import { json } from "@sveltejs/kit";
import type Stripe from "stripe";
import { z } from "zod";
import { api } from "$convex/api";
import { PRODUCTS } from "$lib/data/products";
import { limited } from "$lib/server/rate-limit";
import { getConvex, getStripe, type OrderItem } from "$lib/utils/api";
import type { RequestHandler } from "./$types";

export const prerender = false;

const CheckoutItemSchema = z.object({
  slug: z.string().min(1),
  size: z.string().min(1),
});

const CheckoutBodySchema = z.object({
  items: z.array(CheckoutItemSchema).min(1),
  couponCode: z.string().optional(),
});

// Discount semantics: percent coupons reduce each merged line proportionally;
// fixed coupons subtract once per order, allocated across lines by largest
// remainder. Per-unit prices are floored to whole cents, so the stored order
// total always equals the amount Stripe charges.
function applyDiscount(
  orderItems: OrderItem[],
  percentOff: number | null,
  fixedOff: number | null,
): { items: OrderItem[]; total: number; discount: number } {
  const subtotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const target = percentOff !== null ? Math.round((subtotal * percentOff) / 100) : Math.min(fixedOff ?? 0, subtotal);

  const shares = new Array(orderItems.length).fill(0);
  const rank = orderItems
    .map((i) => i.price * i.quantity)
    .map((gross, index) => ({ gross, index }))
    .sort((a, b) => b.gross - a.gross)
    .map((g) => g.index);
  let remaining = target;
  let progress = true;
  while (remaining > 0 && progress) {
    progress = false;
    for (let position = 0; position < rank.length && remaining > 0; position++) {
      const index = rank[position];
      const cap = orderItems[index].price * orderItems[index].quantity - 1 - shares[index];
      if (cap <= 0) continue;
      const take = Math.min(Math.max(1, Math.ceil(remaining / (rank.length - position))), cap);
      shares[index] += take;
      remaining -= take;
      progress = true;
    }
  }

  const items = orderItems.map((item, index) => ({
    ...item,
    price: Math.max(1, Math.floor((item.price * item.quantity - shares[index]) / item.quantity)),
  }));
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  return { items, total, discount: subtotal - total };
}

type OrderItemsResult = { items: OrderItem[] } | { error: string };

// Merges duplicate slug+size entries and validates them against live stock.
async function buildOrderItems(
  convex: ReturnType<typeof getConvex>,
  items: Array<{ slug: string; size: string }>,
): Promise<OrderItemsResult> {
  const merged = new Map<string, number>();
  for (const item of items) {
    merged.set(`${item.slug}|${item.size}`, (merged.get(`${item.slug}|${item.size}`) ?? 0) + 1);
  }

  // Single batched inventory read instead of one query per line.
  const stocks = await convex.query(api.products.getStockBySlugs, {
    slugs: [...new Set([...merged.keys()].map((k) => k.split("|")[0]))],
  });

  const orderItems: OrderItem[] = [];

  for (const [key, quantity] of merged) {
    const [slug, size] = key.split("|");
    const product = PRODUCTS.find((p) => p.slug === slug);
    if (!product?.sizes.includes(size)) continue;

    const stock = stocks[slug];
    if (!stock || (stock.sizeStock[size] ?? 0) < quantity) {
      return { error: `Insufficient stock for ${product.name} (size ${size})` };
    }

    orderItems.push({
      productId: stock.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      size,
      quantity,
    });
  }

  if (!orderItems.length) return { error: "No valid items" };
  return { items: orderItems };
}

type CouponResult = { couponId?: string; items?: OrderItem[]; total?: number; error?: string };

// Validates the coupon code and applies it to the merged order items.
async function applyCoupon(
  convex: ReturnType<typeof getConvex>,
  couponCode: string,
  orderItems: OrderItem[],
): Promise<CouponResult> {
  const subtotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const result = await convex.query(api.coupons.validate, { code: couponCode, orderTotal: subtotal });
  if (!result.valid) return { error: result.error ?? "Invalid coupon" };
  // Applied by us rather than via a Stripe coupon object: amount_off coupons
  // discount per line-item unit in Stripe, mis-charging multi-item carts.
  const discounted = applyDiscount(
    orderItems,
    result.type === "percent" ? result.value : null,
    result.type === "fixed" ? result.value : null,
  );
  return { couponId: result.couponId ?? undefined, items: discounted.items, total: discounted.total };
}

function toLineItems(orderItems: OrderItem[]): Stripe.Checkout.SessionCreateParams["line_items"] {
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
  if (await limited(request, "checkout", 10)) {
    return json({ error: "Too many requests" }, { status: 429 });
  }
  const stripe = getStripe();
  const convex = getConvex();
  try {
    const raw = await request.json();
    const parsed = CheckoutBodySchema.safeParse(raw);
    if (!parsed.success) {
      return json({ error: "Invalid request body" }, { status: 400 });
    }

    const { items, couponCode } = parsed.data;

    const orderResult = await buildOrderItems(convex, items);
    if ("error" in orderResult) {
      return json({ error: orderResult.error }, { status: 400 });
    }
    let orderItems = orderResult.items;

    const subtotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
    let total = subtotal;
    let couponId: string | undefined;

    if (couponCode) {
      const result = await applyCoupon(convex, couponCode, orderItems);
      if (result.error) {
        return json({ error: result.error }, { status: 400 });
      }
      couponId = result.couponId;
      orderItems = result.items ?? orderItems;
      total = result.total ?? total;
    }

    const lineItems = toLineItems(orderItems);

    const origin = url.origin;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: [
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
        ],
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      metadata: {
        couponId: couponId ?? "",
        orderItems: JSON.stringify(orderItems),
        total: String(total),
      },
    });

    return json({ url: session.url }, { status: 200 });
  } catch (err) {
    captureException(err);
    return json({ error: "Checkout failed" }, { status: 500 });
  }
};
