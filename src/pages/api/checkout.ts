export const prerender = false;

import type { APIRoute } from "astro";
import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);
const convex = new ConvexHttpClient(import.meta.env.CONVEX_URL);

interface CheckoutRequestBody {
  items?: Array<{ slug: string; size: string }>;
  couponCode?: string;
}

interface OrderItem {
  productId: Id<"products">;
  slug: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as CheckoutRequestBody;
    const { items, couponCode } = body;

    if (!items?.length) {
      return new Response(JSON.stringify({ error: "No items" }), { status: 400 });
    }

    const lineItems: Stripe.Checkout.SessionCreateParams["line_items"] = [];
    const orderItems: OrderItem[] = [];

    for (const item of items) {
      const product = await convex.query(api.products.getBySlug, { slug: item.slug });
      if (!product || !product.active) continue;

      const sizeAvailable = product.sizeStock?.[item.size] ?? 0;
      if (sizeAvailable < 1) continue;

      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: product.name,
            description: `Size ${item.size}`,
            metadata: { slug: product.slug },
          },
          unit_amount: product.price * 100,
        },
        quantity: 1,
      });

      orderItems.push({
        productId: product._id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        size: item.size,
        quantity: 1,
      });
    }

    if (!lineItems.length) {
      return new Response(JSON.stringify({ error: "No valid items" }), { status: 400 });
    }

    // Coupon validation
    let discounts: Stripe.Checkout.SessionCreateParams["discounts"] = undefined;
    let couponId: Id<"coupons"> | undefined;
    const orderTotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);

    if (couponCode) {
      const result = await convex.query(api.coupons.validate, { code: couponCode, orderTotal });
      if (!result.valid) {
        return new Response(JSON.stringify({ error: result.error }), { status: 400 });
      }
      couponId = result.couponId as Id<"coupons"> | undefined;

      const stripeCoupon = await stripe.coupons.create(
        result.type === "percent"
          ? { percent_off: result.value ?? 0, duration: "once" as const }
          : { amount_off: (result.discount ?? 0) * 100, currency: "eur", duration: "once" as const }
      );
      discounts = [{ coupon: stripeCoupon.id }];
    }

    const origin = new URL(request.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      ...(discounts ? { discounts } : {}),
      shipping_address_collection: {
        allowed_countries: ["US", "GB", "DE", "FR", "IT", "ES", "NL", "BE", "AT", "CH", "SE", "DK", "NO", "JP", "AU", "CA"],
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      metadata: { couponId: couponId ?? "", orderItems: JSON.stringify(orderItems) },
    });

    if (couponId) {
      await convex.mutation(api.coupons.use, { id: couponId });
    }

    await convex.mutation(api.orders.create, {
      stripeSessionId: session.id,
      customerEmail: "",
      items: orderItems,
      total: orderTotal,
      currency: "eur",
    });

    return new Response(JSON.stringify({ url: session.url }), { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Checkout error:", err);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};
