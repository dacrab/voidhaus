import { api } from "../_generated/api";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function requireAdmin(ctx: QueryCtx | MutationCtx, token: string) {
  const valid = await ctx.runQuery(api.auth.validateSession, { token });
  if (!valid) throw new Error("Unauthorized");
}
