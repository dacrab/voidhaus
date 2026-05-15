import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Protect admin routes (except login page)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const cookie = context.cookies.get("vh-admin-token");
    const param = context.url.searchParams.get("token");
    const validToken = import.meta.env.ADMIN_TOKEN;

    // Allow setting token via query param (redirects to clean URL)
    if (param && param === validToken) {
      context.cookies.set("vh-admin-token", param, {
        path: "/admin",
        httpOnly: true,
        secure: import.meta.env.PROD,
        maxAge: 60 * 60 * 24 * 7,
      });
      return context.redirect(pathname);
    }

    if (!cookie || cookie.value !== validToken) {
      return context.redirect("/admin/login");
    }
  }

  return next();
});
