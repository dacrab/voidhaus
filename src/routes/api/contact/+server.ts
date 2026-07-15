import { json } from "@sveltejs/kit";
import { api } from "$convex/api";
import { getConvex, toError } from "$lib/utils/api";
import type { RequestHandler } from "./$types";

export const prerender = false;

export const POST: RequestHandler = async ({ request }) => {
  const convex = getConvex();
  try {
    const body = (await request.json()) as Record<string, string | undefined>;
    const { name, email, message } = body;

    if (!name?.trim() || !email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) || !message?.trim()) {
      return json({ error: "Missing fields" }, { status: 400 });
    }

    await convex.mutation(api.messages.create, {
      name: name.trim(),
      email: email.trim(),
      subject: "General",
      message: message.trim(),
    });

    return json({ ok: true }, { status: 200 });
  } catch (err: unknown) {
    return json({ error: toError(err) }, { status: 500 });
  }
};
