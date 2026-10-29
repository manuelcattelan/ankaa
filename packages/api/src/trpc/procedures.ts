import { initTRPC, TRPCError } from "@trpc/server";
import { STATUS_CODES } from "node:http";

import type { Context } from "#/trpc/context.ts";

const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;

const t = initTRPC.context<Context>().create({
  errorFormatter: ({ shape }) => {
    if (shape.data.httpStatus < HTTP_STATUS_INTERNAL_SERVER_ERROR) {
      return shape;
    }

    return {
      ...shape,
      message: STATUS_CODES[shape.data.httpStatus] ?? "Internal Server Error",
    };
  },
});

const requireSession = t.middleware(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({ ctx: { session: ctx.session } });
});

export const createCallerFactory = t.createCallerFactory;
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(requireSession);
