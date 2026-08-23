import { ConvexError, v } from "convex/values";
import { isValidEmail, LIMITS } from "../src/lib/data/limits";
import { mutation } from "./_generated/server";

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const email = args.email.trim();
    const subject = args.subject.trim();
    const message = args.message.trim();

    if (!(name && email && subject && message)) {
      throw new ConvexError("All fields are required");
    }
    if (!isValidEmail(email)) throw new ConvexError("Invalid email");
    if (name.length > LIMITS.nameMax || subject.length > LIMITS.subjectMax || message.length > LIMITS.messageMax) {
      throw new ConvexError("Message too long");
    }

    return await ctx.db.insert("messages", {
      name,
      email,
      subject,
      message,
      read: false,
    });
  },
});
