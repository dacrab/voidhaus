import { json } from "@sveltejs/kit";
import { api } from "$convex/api";
import { getConvex } from "$lib/utils/api";
import type { RequestHandler } from "./$types";

export const prerender = false;

export const POST: RequestHandler = async ({ request }) => {
  const convex = getConvex();
  const { email } = await request.json();

  if (!email || typeof email !== "string") {
    return json({ error: "Email is required" }, { status: 400 });
  }

  const orders = await convex.query(api.orders.getByEmail, { email });
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
