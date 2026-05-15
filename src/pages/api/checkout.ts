export const prerender = false;

import type { APIRoute } from "astro";
import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);
const convex = new ConvexHttpClient(import.meta.env.CONVEX_URL);

export const POST: APIRoute = async ({ request }) => {
  try {
    const { items, couponCode } = await request.json();
    if (!items?.length) {
      return new Response(JSON.stringify({ error: "No items" }), { status: 400 });
    }

    // Resolve products from Convex to get current prices
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const orderItems: Array<{
      productId: string;
      slug: string;
      name: string;
      price: number;
      size: string;
      quantity: number;
    }> = [];

    for (const item of items) {
      const product = await convex.query(api.products.getBySlug, { slug: item.slug });
      if (!product || !product.active) continue;
      // Check per-size stock
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

    // Validate and apply coupon
    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];
    let couponId: string | undefined;
    const orderTotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);

    if (couponCode) {
      const result = await convex.query(api.coupons.validate, {
        code: couponCode,
        orderTotal,
      });
      if (!result.valid) {
        return new Response(JSON.stringify({ error: result.error }), { status: 400 });
      }
      couponId = result.couponId;
      // Create a Stripe coupon on the fly
      const stripeCoupon = await stripe.coupons.create(
        result.type === "percent"
          ? { percent_off: result.value, duration: "once" }
          : { amount_off: result.discount! * 100, currency: "eur", duration: "once" }
      );
      discounts = [{ coupon: stripeCoupon.id }];
    }

    const origin = new URL(request.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      discounts,
      shipping_address_collection: { allowed_countries: ["US", "GB", "DE", "FR", "IT", "ES", "NL", "BE", "AT", "CH", "SE", "DK", "NO", "JP", "AU", "CA"] },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      metadata: { couponId: couponId ?? "", orderItems: JSON.stringify(orderItems) },
    });

    // Mark coupon as used
    if (couponId) {
      await convex.mutation(api.coupons.use, { id: couponId as any });
    }

    // Create pending order in Convex
    await convex.mutation(api.orders.create, {
      stripeSessionId: session.id,
      customerEmail: "",
      items: orderItems as any,
      total: orderTotal,
      currency: "eur",
    });

    return new Response(JSON.stringify({ url: session.url }), { status: 200 });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
