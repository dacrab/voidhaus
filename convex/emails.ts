import { v } from "convex/values";
import { formatPrice } from "../src/lib/utils/cart";
import { internalAction } from "./_generated/server";

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// Called after order is fulfilled (paid). Sends confirmation email via Resend.
export const sendOrderConfirmation = internalAction({
  args: {
    customerEmail: v.string(),
    orderItems: v.array(
      v.object({
        name: v.string(),
        size: v.string(),
        price: v.number(),
        quantity: v.number(),
      }),
    ),
    total: v.number(),
  },
  handler: async (_, args) => {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return;
    }

    const itemsHtml = args.orderItems
      .map((i) => {
        const qty = i.quantity > 1 ? ` × ${i.quantity}` : "";
        return `<tr><td>${escapeHtml(i.name)}${qty}</td><td>${escapeHtml(i.size)}</td><td>€ ${formatPrice(i.price * i.quantity)}</td></tr>`;
      })
      .join("");

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="font-weight: 300; letter-spacing: -0.02em;">VOIDHAUS</h1>
        <p>Thank you for your order. Here's your confirmation:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <thead><tr style="border-bottom: 1px solid #eee;">
            <th style="text-align: left; padding: 8px 0;">Item</th>
            <th style="text-align: left; padding: 8px 0;">Size</th>
            <th style="text-align: left; padding: 8px 0;">Price</th>
          </tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p style="font-size: 18px; font-weight: 500;">Total: € ${formatPrice(args.total)}</p>
        <p style="color: #666; font-size: 14px;">Complimentary worldwide shipping · 5–10 business days</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
        <p style="color: #999; font-size: 12px;">VOIDHAUS — studio@voidhaus.com</p>
      </div>
    `;

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "VOIDHAUS <orders@voidhaus.com>",
          to: args.customerEmail,
          subject: "Order Confirmed — VOIDHAUS",
          html,
        }),
      });
      if (!res.ok) {
        // biome-ignore lint/suspicious/noConsole: email delivery failures surface in server logs
        console.error("Resend email failed:", res.status, await res.text());
      }
    } catch (err) {
      // biome-ignore lint/suspicious/noConsole: email send failures surface in server logs without failing the order
      console.error("Failed to send order confirmation email:", err);
    }
  },
});

// Trigger a Vercel rebuild when products change
export const triggerRebuild = internalAction({
  args: {},
  handler: async () => {
    const hookUrl = process.env.VERCEL_DEPLOY_HOOK;
    if (!hookUrl) {
      return;
    }
    try {
      const res = await fetch(hookUrl, { method: "POST" });
      if (!res.ok) {
        // biome-ignore lint/suspicious/noConsole: deploy hook failures surface in server logs
        console.error("Vercel deploy hook failed:", res.status, await res.text());
      }
    } catch (err) {
      // biome-ignore lint/suspicious/noConsole: rebuild trigger failures surface in server logs without throwing
      console.error("Failed to trigger Vercel rebuild:", err);
    }
  },
});
