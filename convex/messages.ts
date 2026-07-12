import { v } from "convex/values";
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

    if (!name || !email || !subject || !message) {
      throw new Error("All fields are required");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Invalid email");
    }
    if (name.length > 200 || subject.length > 200 || message.length > 5000) {
      throw new Error("Message too long");
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
