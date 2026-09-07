// Shared client-side response schemas: the single source of truth for the JSON
// shapes returned by our own API routes. Client fetches safeParse against these
// instead of blind-casting res.json(); types are derived via z.infer so the
// client can never drift from the server contract silently.
import { z } from "zod";

// Mirrors the orders table status union (convex/schema.ts).
const OrderStatusSchema = z.enum(["pending", "paid", "failed"]);

export const OrderRowSchema = z.object({
  id: z.string(),
  items: z.array(
    z.object({
      name: z.string(),
      size: z.string(),
      price: z.number(),
      quantity: z.number(),
    }),
  ),
  total: z.number(),
  discount: z.number(),
  currency: z.string(),
  status: OrderStatusSchema,
  createdAt: z.number(),
});

export type OrderRow = z.infer<typeof OrderRowSchema>;

// /api/checkout responds with either a Stripe redirect URL or an error.
export const CheckoutResponseSchema = z.union([
  z.object({ url: z.string().min(1) }),
  z.object({ error: z.string().min(1) }),
]);

// /api/orders (success shape).
export const OrdersResponseSchema = z.object({
  orders: z.array(OrderRowSchema),
});

// /api/* error envelopes (best-effort; messages are optional).
export const ApiErrorSchema = z.object({
  error: z.string().optional(),
});
