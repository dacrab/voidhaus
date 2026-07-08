import { json } from "@sveltejs/kit";
import { api } from "$convex/api";
import { getConvex } from "$lib/utils/api";
import type { RequestHandler } from "./$types";

export const prerender = false;

interface ContactRequestBody {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export const POST: RequestHandler = async ({ request }) => {
  const convex = getConvex();
  try {
    const body: ContactRequestBody = await request.json();
    const { name, email, subject, message } = body;

    if (!name?.trim() || !email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) || !message?.trim()) {
      return json({ error: "Missing fields" }, { status: 400 });
    }

    await convex.mutation(api.messages.create, {
      name: name.trim(),
      email: email.trim(),
      subject: subject || "General",
      message: message.trim(),
    });

    return json({ ok: true }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return json({ error: msg }, { status: 500 });
  }
};
