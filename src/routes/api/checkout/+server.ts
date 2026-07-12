import { captureException } from "@sentry/sveltekit";
import { json } from "@sveltejs/kit";
import type Stripe from "stripe";
import { api } from "$convex/api";
import type { Id } from "$convex/dataModel";
import { getConvex, getStripe } from "$lib/utils/api";
import type { RequestHandler } from "./$types";

export const prerender = false;

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

export const POST: RequestHandler = async ({ request, url }) => {
  const stripe = getStripe();
  const convex = getConvex();
  try {
    const body: CheckoutRequestBody = await request.json();
    const { items, couponCode } = body;

    if (!items?.length) {
      return json({ error: "No items" }, { status: 400 });
    }

    const lineItems: Stripe.Checkout.SessionCreateParams["line_items"] = [];
    const orderItems: OrderItem[] = [];

    for (const item of items) {
      const product = await convex.query(api.products.getBySlug, { slug: item.slug });
      if (!product?.active) continue;

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
      return json({ error: "No valid items" }, { status: 400 });
    }

    let discounts: Stripe.Checkout.SessionCreateParams["discounts"];
    let couponId: Id<"coupons"> | undefined;
    const orderTotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);

    if (couponCode) {
      const result = await convex.query(api.coupons.validate, { code: couponCode, orderTotal });
      if (!result.valid) {
        return json({ error: result.error }, { status: 400 });
      }
      couponId = result.couponId;

      const stripeCoupon = await stripe.coupons.create(
        result.type === "percent"
          ? { percent_off: result.value ?? 0, duration: "once" as const }
          : { amount_off: (result.discount ?? 0) * 100, currency: "eur", duration: "once" as const },
      );
      discounts = [{ coupon: stripeCoupon.id }];
    }

    const origin = url.origin;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      ...(discounts ? { discounts } : {}),
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
      metadata: { couponId: couponId ?? "", orderItems: JSON.stringify(orderItems) },
    });

    return json({ url: session.url }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    captureException(err);
    return json({ error: message }, { status: 500 });
  }
};
