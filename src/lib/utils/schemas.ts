import { z } from "zod";

const OrderStatusSchema = z.enum(["paid", "failed"]);

const PurchasedItemSchema = z.object({
  name: z.string(),
  size: z.string(),
  price: z.number(),
  quantity: z.number(),
});

// Order item as sent from checkout through the Stripe webhook into Convex.
const CheckoutOrderItemSchema = PurchasedItemSchema.extend({
  slug: z.string().min(1),
});

export type CheckoutOrderItem = z.infer<typeof CheckoutOrderItemSchema>;

const OrderRowSchema = z.object({
  id: z.string(),
  items: z.array(PurchasedItemSchema),
  total: z.number(),
  discount: z.number(),
  currency: z.string(),
  status: OrderStatusSchema,
  createdAt: z.number(),
});

export type OrderRow = z.infer<typeof OrderRowSchema>;

export const CheckoutResponseSchema = z.union([
  z.object({ url: z.string().min(1) }),
  z.object({ error: z.string().min(1) }),
]);

export const OrdersResponseSchema = z.object({
  orders: z.array(OrderRowSchema),
});

export const StockResponseSchema = z.object({
  stock: z.record(z.string(), z.number()),
});

export const ApiErrorSchema = z.object({
  error: z.string().optional(),
});
