import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import type * as Layer from "effect/Layer";
import type * as ManagedRuntime from "effect/ManagedRuntime";

import { Authentication } from "@ankaa/authentication/authentication";
import { fromNodeHeaders } from "better-auth/node";
import * as Effect from "effect/Effect";

import type { applicationLayer } from "#/application-layer.ts";

import { PinoLogger } from "#/shared/pino-logger.ts";

export type ApplicationRuntime = ManagedRuntime.ManagedRuntime<
  Layer.Success<typeof applicationLayer>,
  unknown
>;

export type Context = ReturnType<typeof createInnerContext>;

type CreateContextOptions = CreateFastifyContextOptions & {
  runtime: ApplicationRuntime;
};

type CreateInnerContextOptions = {
  runtime: ApplicationRuntime;
  session: Effect.Success<ReturnType<Authentication["Service"]["getSession"]>>;
};

export async function createContext({
  req,
  res,
  runtime,
}: CreateContextOptions) {
  const session = await runtime.runPromise(
    Effect.gen(function* () {
      const authentication = yield* Authentication;

      return yield* authentication.getSession(fromNodeHeaders(req.headers));
    }).pipe(Effect.provideService(PinoLogger, req.log)),
  );

  return { ...createInnerContext({ runtime, session }), req, res };
}

export function createInnerContext({
  runtime,
  session,
}: CreateInnerContextOptions) {
  return { runtime, session };
}
