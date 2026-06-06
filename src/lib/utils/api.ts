import { ConvexHttpClient } from 'convex/browser';
import Stripe from 'stripe';

export function getConvex() {
  return new ConvexHttpClient(import.meta.env.CONVEX_URL);
}

export function getStripe() {
  return new Stripe(import.meta.env.STRIPE_SECRET_KEY);
}