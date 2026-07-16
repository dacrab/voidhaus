import { json } from "@sveltejs/kit";
import { z } from "zod";
import { api } from "$convex/api";
import { getConvex } from "$lib/utils/api";
import type { RequestHandler } from "./$types";

export const prerender = false;

const ContactSchema = z.object({
  name: z.string().min(1).max(500),
  email: z.string().email().max(500),
  message: z.string().min(1).max(5000),
});

export const POST: RequestHandler = async ({ request }) => {
  const convex = getConvex();
  try {
    const raw = await request.json();
    const parsed = ContactSchema.safeParse(raw);
    if (!parsed.success) {
      return json({ error: "Invalid fields" }, { status: 400 });
    }

    const { name, email, message } = parsed.data;

    await convex.mutation(api.messages.create, {
      name: name.trim(),
      email: email.trim(),
      subject: "General",
      message: message.trim(),
    });

    return json({ ok: true }, { status: 200 });
  } catch {
    return json({ error: "Something went wrong" }, { status: 500 });
  }
};
