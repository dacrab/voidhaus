import { ConvexHttpClient } from "convex/browser";
import Stripe from "stripe";
import { env } from "$env/dynamic/private";

let _convex: ConvexHttpClient | null = null;
let _stripe: Stripe | null = null;

export interface OrderItem {
  slug: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
}

export function getConvex(): ConvexHttpClient {
  if (!_convex) {
    const url = env.CONVEX_URL;
    if (!url) throw new Error("CONVEX_URL is not configured");
    _convex = new ConvexHttpClient(url);
  }
  return _convex;
}

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
    _stripe = new Stripe(key);
  }
  return _stripe;
}
