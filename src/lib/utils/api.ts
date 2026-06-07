import { CONVEX_URL, STRIPE_SECRET_KEY } from '$env/static/private';
import { ConvexHttpClient } from 'convex/browser';
import Stripe from 'stripe';

export function getConvex() {
  return new ConvexHttpClient(CONVEX_URL);
}

export function getStripe() {
  return new Stripe(STRIPE_SECRET_KEY);
}
