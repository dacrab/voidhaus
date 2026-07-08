import { writeFileSync } from "node:fs";

const SITE = "https://voidhaus.com";
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
  "/product/ash-trousers",
  "/product/bone-shirt",
  "/product/cashmere-knit",
  "/product/dark-layer-coat",
  "/product/eclipse-boots",
  "/product/obsidian-coat",
  "/product/shadow-dress",
  "/product/silk-slip",
  "/product/void-belt",
  "/product/void-jacket",
  "/product/void-tote",
  "/product/wool-trousers",
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (p) => `  <url>
    <loc>${SITE}${p}</loc>
    <changefreq>weekly</changefreq>
    <priority>${p === "" ? "1.0" : "0.7"}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

writeFileSync("static/sitemap.xml", xml);
console.log(`Sitemap generated with ${pages.length} URLs`);
