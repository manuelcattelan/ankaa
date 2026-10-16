import { initTRPC, TRPCError } from "@trpc/server";
import { STATUS_CODES } from "node:http";

import type { Context } from "./context.ts";

const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;

const trpc = initTRPC.context<Context>().create({
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

const requireSession = trpc.middleware(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({ ctx: { session: ctx.session } });
});

export const router = trpc.router;
export const publicProcedure = trpc.procedure;
export const protectedProcedure = trpc.procedure.use(requireSession);
