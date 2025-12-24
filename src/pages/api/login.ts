export const prerender = false;

import type { APIRoute } from "astro";
import { createSessionCookie } from "~/lib/session";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");
  const remember = formData.get("remember") === "on";

  const ADMIN_USER = import.meta.env.USERNAME;
  const ADMIN_PASS = import.meta.env.PASSWORD;

  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    return redirect("/clients/login?error=wrong");
  }

  const sessionValue = await createSessionCookie(username as string);

  cookies.set("session", sessionValue, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: remember ? 30 * 24 * 60 * 60 : 2 * 60 * 60,
  });

  return redirect("/clients");
};