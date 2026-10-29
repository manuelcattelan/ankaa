import { HTTP_STATUS_INTERNAL_SERVER_ERROR } from "@ankaa/core/shared/constants/http-status-internal-server-error";
import { initTRPC, TRPCError } from "@trpc/server";
import * as Schema from "effect/Schema";
import { STATUS_CODES } from "node:http";

import type { Context } from "#/trpc/context.ts";

import { wireErrorSchema } from "#/trpc/wire-error-schema.ts";

const isWireError = Schema.is(wireErrorSchema);

const encodeWireError = Schema.encodeSync(wireErrorSchema);

const t = initTRPC.context<Context>().create({
  errorFormatter: ({ error, shape }) => {
    const data = {
      ...shape.data,
      wireError: isWireError(error.cause) ? encodeWireError(error.cause) : null,
    };

    if (shape.data.httpStatus < HTTP_STATUS_INTERNAL_SERVER_ERROR) {
      return { ...shape, data };
    }

    return {
      ...shape,
      data,
      message: STATUS_CODES[shape.data.httpStatus] ?? "Internal Server Error",
    };
  },
});

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
