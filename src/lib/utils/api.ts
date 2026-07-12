import { ConvexHttpClient } from "convex/browser";
import Stripe from "stripe";
import { env } from "$env/dynamic/private";

let _convex: ConvexHttpClient | null = null;
let _stripe: Stripe | null = null;

export function getConvex(): ConvexHttpClient {
  if (!_convex) _convex = new ConvexHttpClient(env.CONVEX_URL);
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
