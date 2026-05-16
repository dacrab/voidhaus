export const prerender = false;

import type { APIRoute } from "astro";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

const convex = new ConvexHttpClient(import.meta.env.CONVEX_URL);

export const GET: APIRoute = async ({ url }) => {
  const slug = url.searchParams.get("slug");

  if (slug) {
    const product = await convex.query(api.products.getBySlug, { slug });
    if (!product) {
      return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
    }
    return new Response(
      JSON.stringify({
        slug: product.slug,
        stock: product.stock,
        sizeStock: product.sizeStock ?? {},
        active: product.active,
      }),
      { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" } }
    );
  }

  const products = await convex.query(api.products.list, {});
  const stock = products.map((p) => ({
    slug: p.slug,
    stock: p.stock,
    sizeStock: p.sizeStock ?? {},
  }));
  return new Response(JSON.stringify(stock), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
  });
};
