import { defineMiddleware } from "astro:middleware";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const cookie = context.cookies.get("vh-admin-session");

    if (!cookie?.value) {
      return context.redirect("/admin/login");
    }

    // Validate session — if Convex is unreachable, allow through
    // (better to show admin than to lock out on transient errors)
    const convexUrl = import.meta.env.CONVEX_URL;
    if (convexUrl) {
      try {
        const convex = new ConvexHttpClient(convexUrl);
        const admin = await convex.query(api.auth.validateSession, {
          token: cookie.value,
        });
        if (admin === null) {
          context.cookies.delete("vh-admin-session", { path: "/admin" });
          return context.redirect("/admin/login");
        }
      } catch (e) {
        // Log but don't block — transient Convex errors shouldn't lock admin out
        console.error("Admin session validation error:", e);
      }
    }
  }

  return next();
});
