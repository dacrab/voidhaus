import { z } from "zod";
import { api } from "#convex/api.js";
import { LIMITS } from "#lib/data/limits.js";
import { isRateLimited } from "#lib/server/rate-limit.js";
import { getConvex } from "#lib/utils/api.js";
import type { RequestHandler } from "./$types";

export const prerender = false;

const ContactSchema = z.object({
  name: z.string().min(1).max(LIMITS.nameMax),
  email: z.email().max(LIMITS.emailMax),
  message: z.string().min(1).max(LIMITS.messageMax),
});

export const POST: RequestHandler = async ({ request }) => {
  if (await isRateLimited(request, "contact", 5)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const parsed = ContactSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json({ error: "Invalid fields" }, { status: 400 });
    }

    const { name, email, message } = parsed.data;
    await getConvex().mutation(api.messages.create, {
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    });

    return Response.json({ ok: true }, { status: 200 });
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: contact submission failures surface in server logs
    console.error("Contact submission failed:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
};
