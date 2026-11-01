import { z } from "zod";
import { api } from "#convex/api.js";
import { isRateLimited } from "#lib/server/rate-limit.js";
import { getConvex } from "#lib/utils/api.js";
import type { RequestHandler } from "./$types";

export const prerender = false;

const StockQuerySchema = z.object({
  slug: z.string().min(1),
});

export const GET: RequestHandler = async ({ request, url }) => {
  if (await isRateLimited(request, "stock", 120)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  const parsed = StockQuerySchema.safeParse({ slug: url.searchParams.get("slug") });
  if (!parsed.success) {
    return Response.json({ error: "A product slug is required" }, { status: 400 });
  }

  try {
    const stocks = await getConvex().query(api.products.getStockBySlugs, {
      slugs: [parsed.data.slug],
    });

    return Response.json(
      { stock: stocks[parsed.data.slug] ?? {} },
      { headers: { "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=60" } },
    );
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: stock lookup failures surface in server logs
    console.error("Stock lookup failed:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
};
