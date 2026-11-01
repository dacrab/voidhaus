import { SITE_URL } from "#lib/site-url.js";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = () =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL("/sitemap.xml", SITE_URL).href}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
