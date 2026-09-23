import { initTRPC, TRPCError } from "@trpc/server";

import type { Context } from "./context.ts";

const trpc = initTRPC.context<Context>().create();

const requireSession = trpc.middleware(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({ ctx: { session: ctx.session } });
});

export const router = trpc.router;
export const publicProcedure = trpc.procedure;
export const protectedProcedure = trpc.procedure.use(requireSession);
