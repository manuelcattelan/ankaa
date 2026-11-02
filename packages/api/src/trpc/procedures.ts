import { initTRPC, TRPCError } from "@trpc/server";

import type { Context } from "#/trpc/context.ts";

import { errorFormatter } from "#/trpc/error-formatter.ts";

const t = initTRPC.context<Context>().create({ errorFormatter });

const requireSession = t.middleware(({ ctx, next }) => {
  if (ctx.session === null) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({ ctx: { session: ctx.session } });
});

export const createCallerFactory = t.createCallerFactory;
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(requireSession);
