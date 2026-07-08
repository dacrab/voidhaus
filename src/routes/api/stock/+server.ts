import { json } from "@sveltejs/kit";
import { api } from "$convex/api";
import { getConvex } from "$lib/utils/api";
import type { RequestHandler } from "./$types";

export const prerender = false;

export const GET: RequestHandler = async ({ url }) => {
  const convex = getConvex();
  const slug = url.searchParams.get("slug");

  if (slug) {
    const product = await convex.query(api.products.getBySlug, { slug });
    if (!product) {
      return json({ error: "Not found" }, { status: 404 });
    }
    return json(
      {
        slug: product.slug,
        stock: product.stock,
        sizeStock: product.sizeStock ?? {},
        active: product.active,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-cache" },
      },
    );
  }

  const products = await convex.query(api.products.list, {});
  const stock = products.map((p) => ({
    slug: p.slug,
    stock: p.stock,
    sizeStock: p.sizeStock ?? {},
  }));
  return json(stock, {
    status: 200,
    headers: { "Cache-Control": "no-cache" },
  });
};
