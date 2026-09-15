import { initTRPC, TRPCError } from "@trpc/server";

import type { Context } from "./context.ts";

const t = initTRPC.context<Context>().create();

export const router = t.router;

/**
 * Unprotected procedure
 */
export const publicProcedure = t.procedure;

/**
 * Protected procedure
 */
export const protectedProcedure = t.procedure.use(function isAuthed(opts) {
  if (!opts.ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }
  return opts.next({
    ctx: {
      session: opts.ctx.session,
    },
  });
});
