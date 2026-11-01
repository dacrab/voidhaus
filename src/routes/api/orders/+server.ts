import { z } from "zod";
import { api } from "#convex/api.js";
import { isRateLimited } from "#lib/server/rate-limit.js";
import { getConvex } from "#lib/utils/api.js";
import type { RequestHandler } from "./$types";

export const prerender = false;

// Order lookup is capability-gated: callers must present the Stripe checkout
// session id, which is only revealed to the payer on the post-payment redirect.
const SessionSchema = z.object({
  sessionId: z.string().min(10),
});

export const POST: RequestHandler = async ({ request }) => {
  if (await isRateLimited(request, "orders", 30)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const parsed = SessionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json({ error: "A checkout session id is required" }, { status: 400 });
    }

    const orders = await getConvex().query(api.orders.getBySession, {
      sessionId: parsed.data.sessionId,
    });

    return Response.json({ orders }, { status: 200 });
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: order lookup failures surface in server logs
    console.error("Order lookup failed:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
};
