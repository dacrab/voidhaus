import { PRODUCTS } from "#lib/data/products.js";
import { SITE } from "#lib/data/site.js";
import type { RequestHandler } from "./$types";

export const prerender = true;

const STATIC_PAGES = ["/", "/collection", "/lookbook", "/about", "/stockists", "/contact", "/privacy", "/terms"];

export const GET: RequestHandler = () => {
  const paths = [...STATIC_PAGES, ...PRODUCTS.map((product) => `/product/${product.slug}`)];

  const urls = paths.map((path) => `  <url><loc>${new URL(path, SITE.url).href}</loc></url>`).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
