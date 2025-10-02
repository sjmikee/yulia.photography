import type { MiddlewareHandler } from "astro";

const ADMIN_USER = import.meta.env.USERNAME;
const ADMIN_PASS = import.meta.env.PASSWORD;

export const onRequest: MiddlewareHandler = async (context, next) => {
  if (
    context.url.pathname.startsWith("/clients/add") ||
    context.url.pathname.startsWith("/api/add-client")
  ) {
    const authHeader = context.request.headers.get("authorization");

    if (!authHeader?.startsWith("Basic ")) {
      return new Response("Authentication required", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Restricted Area"',
        },
      });
    }

    const base64Credentials = authHeader.split(" ")[1];
    const decoded = Buffer.from(base64Credentials, "base64").toString("utf-8");
    const [user, pass] = decoded.split(":").map((s) => s.trim());

    if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  return next();
};