import { ConvexError, v } from "convex/values";
import { isValidEmail, LIMITS } from "../src/lib/data/limits";
import { internal } from "./_generated/api";
import { mutation } from "./_generated/server";

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const email = args.email.trim();
    const message = args.message.trim();

    if (!(name && email && message)) throw new ConvexError("All fields are required");
    if (!isValidEmail(email)) throw new ConvexError("Invalid email");
    if (name.length > LIMITS.nameMax || message.length > LIMITS.messageMax) {
      throw new ConvexError("Message too long");
    }

    const id = await ctx.db.insert("messages", { name, email, message });
    await ctx.scheduler.runAfter(0, internal.emails.sendContactNotification, { name, email, message });
    return id;
  },
});
