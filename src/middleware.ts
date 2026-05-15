import { defineMiddleware } from "astro:middleware";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Protect admin routes (except login page)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const cookie = context.cookies.get("vh-admin-session");

    if (!cookie?.value) {
      return context.redirect("/admin/login");
    }

    // Validate session against Convex
    try {
      const convex = new ConvexHttpClient(import.meta.env.CONVEX_URL);
      const admin = await convex.query(api.auth.validateSession, {
        token: cookie.value,
      });
      if (!admin) {
        context.cookies.delete("vh-admin-session", { path: "/admin" });
        return context.redirect("/admin/login");
      }
    } catch {
      // If Convex is unreachable, deny access
      return context.redirect("/admin/login");
    }
  }

  return next();
});
