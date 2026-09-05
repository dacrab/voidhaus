import { json } from "@sveltejs/kit";
import { z } from "zod";
import { api } from "$convex/api";
import { limited } from "$lib/server/rate-limit";
import { getConvex } from "$lib/utils/api";
import type { RequestHandler } from "./$types";

export const prerender = false;

// Order lookup is capability-gated: callers must present the Stripe checkout
// session id, which is only revealed to the payer on the post-payment redirect.
const SessionSchema = z.object({
  sessionId: z.string().min(10),
});

export const POST: RequestHandler = async ({ request }) => {
  if (await limited(request, "orders", 30)) {
    return json({ error: "Too many requests" }, { status: 429 });
  }
  const convex = getConvex();
  try {
    const raw = await request.json();
    const parsed = SessionSchema.safeParse(raw);
    if (!parsed.success) {
      return json({ error: "A checkout session id is required" }, { status: 400 });
    }

    const orders = await convex.query(api.orders.getBySession, { sessionId: parsed.data.sessionId });

    return json(
      {
        orders: orders.map((o) => ({
          id: o.id,
          items: o.items,
          total: o.total,
          discount: o.discount,
          currency: o.currency,
          status: o.status,
          createdAt: o.createdAt,
        })),
      },
      { status: 200 },
    );
  } catch (err) {
    // biome-ignore lint/suspicious/noConsole: order lookup failures surface in server logs
    console.error("Order lookup failed:", err);
    return json({ error: "Something went wrong" }, { status: 500 });
  }
};
