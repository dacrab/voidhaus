import { json } from "@sveltejs/kit";
import { z } from "zod";
import { api } from "$convex/api";
import { getConvex } from "$lib/utils/api";
import type { RequestHandler } from "./$types";

export const prerender = false;

const EmailSchema = z.object({
  email: z.string().email(),
});

export const POST: RequestHandler = async ({ request }) => {
  const convex = getConvex();
  const raw = await request.json();
  const parsed = EmailSchema.safeParse(raw);
  if (!parsed.success) {
    return json({ error: "Valid email is required" }, { status: 400 });
  }

  const orders = await convex.query(api.orders.getByEmail, { email: parsed.data.email });
  const safe = orders.map((o) => ({
    id: o._id,
    items: o.items,
    total: o.total,
    currency: o.currency,
    status: o.status,
    createdAt: o._creationTime,
  }));

  return json({ orders: safe }, { status: 200 });
};
