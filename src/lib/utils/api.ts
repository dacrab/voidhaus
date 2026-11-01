import { ConvexHttpClient } from "convex/browser";
import Stripe from "stripe";
import { CONVEX_URL, STRIPE_SECRET_KEY } from "$app/env/private";

let convexClient: ConvexHttpClient | null = null;
let stripeClient: Stripe | null = null;

export function getConvex(): ConvexHttpClient {
  if (!convexClient) {
    if (!CONVEX_URL) throw new Error("CONVEX_URL is not configured");
    convexClient = new ConvexHttpClient(CONVEX_URL);
  }
  return convexClient;
}

export function getStripe(): Stripe {
  if (!stripeClient) {
    if (!STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not configured");
    stripeClient = new Stripe(STRIPE_SECRET_KEY);
  }
  return stripeClient;
}
