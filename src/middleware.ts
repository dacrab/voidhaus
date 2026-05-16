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

    const convexUrl = import.meta.env.CONVEX_URL;
    if (!convexUrl) {
      return context.redirect("/admin/login");
    }

    try {
      const convex = new ConvexHttpClient(convexUrl);
      const admin = await convex.query(api.auth.validateSession, {
        token: cookie.value,
      });
      if (admin === null) {
        context.cookies.delete("vh-admin-session", { path: "/admin" });
        return context.redirect("/admin/login");
      }
    } catch {
      // Fail-closed: deny access on any error
      return context.redirect("/admin/login");
    }
  }

  return next();
});
