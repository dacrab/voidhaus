import { writeFileSync } from "node:fs";
import { PRODUCTS } from "../src/lib/data/products.ts";
import { SITE } from "../src/lib/data/site.ts";

const pages = [
  "",
  "/collection",
  "/lookbook",
  "/about",
  "/contact",
  "/stockists",
  "/privacy",
  "/terms",
  "/checkout/success",
  ...PRODUCTS.map((p) => `/product/${p.slug}`),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (p) => `  <url>
    <loc>${SITE.url}${p}</loc>
    <changefreq>weekly</changefreq>
    <priority>${p === "" ? "1.0" : "0.7"}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

writeFileSync("static/sitemap.xml", xml);
console.log(`Sitemap generated with ${pages.length} URLs`);
