import { z } from "zod";
import { api } from "#convex/api.js";
import { LIMITS } from "#lib/data/limits.js";
import { limited } from "#lib/server/rate-limit.js";
import { getConvex } from "#lib/utils/api.js";
import type { RequestHandler } from "./$types";

export const prerender = false;

const ContactSchema = z.object({
  name: z.string().min(1).max(LIMITS.nameMax),
  email: z.string().email().max(254),
  message: z.string().min(1).max(LIMITS.messageMax),
});

export const POST: RequestHandler = async ({ request }) => {
  if (await limited(request, "contact", 5)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }
  const convex = getConvex();
  try {
    const raw = await request.json();
    const parsed = ContactSchema.safeParse(raw);
    if (!parsed.success) {
      return Response.json({ error: "Invalid fields" }, { status: 400 });
    }

    const { name, email, message } = parsed.data;

    await convex.mutation(api.messages.create, {
      name: name.trim(),
      email: email.trim(),
      subject: "General",
      message: message.trim(),
    });

    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    // biome-ignore lint/suspicious/noConsole: contact submission failures surface in server logs
    console.error("Contact submission failed:", err);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
};
