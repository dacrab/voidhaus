export const prerender = false;

import type { APIRoute } from "astro";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

const convex = new ConvexHttpClient(import.meta.env.CONVEX_URL);

interface ContactRequestBody {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as ContactRequestBody;
    const { name, email, subject, message } = body;

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
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
};
