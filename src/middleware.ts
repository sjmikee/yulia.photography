import { defineMiddleware } from "astro:middleware";
import { verifySessionCookie } from "~/lib/session";

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  const unprotected = ["/clients/login", "/api/login", "/api/logout"];
  if (unprotected.some((path) => pathname.startsWith(path))) return next();

  if (pathname.startsWith("/clients")) {
    const token = context.cookies.get("session")?.value;
    const validUser = await verifySessionCookie(token || "");
    if (!validUser) {
      context.cookies.delete("session", { path: "/" });
      return context.redirect("/clients/login");
    }
  }

  return next();
});