export const prerender = false;

import type { APIRoute } from "astro";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

const convex = new ConvexHttpClient(import.meta.env.CONVEX_URL);

export const POST: APIRoute = async ({ request }) => {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name?.trim() || !email?.includes("@") || !message?.trim()) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    await convex.mutation(api.messages.create, {
      name: name.trim(),
      email: email.trim(),
      subject: subject || "General",
      message: message.trim(),
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
