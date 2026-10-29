import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import type * as Layer from "effect/Layer";

import { TRPCError } from "@trpc/server";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";

import type { applicationLayer } from "#/application-layer.ts";
import type { ApplicationRuntime } from "#/trpc/context.ts";
import type { WireError } from "#/trpc/wire-error-schema.ts";

import { PinoLogger } from "#/shared/pino-logger.ts";
import { getWireErrorCode } from "#/trpc/get-wire-error-code.ts";
import { wireErrorSchema } from "#/trpc/wire-error-schema.ts";

export async function run<TSuccess, TWireError extends WireError>({
  context,
  effect,
  signal,
}: {
  context: {
    // Only a procedure called over HTTP has a request, because a caller
    // takes the inner context (https://trpc.io/docs/server/context#inner-and-outer-context).
    req?: CreateFastifyContextOptions["req"];
    runtime: ApplicationRuntime;
  };
  effect: Effect.Effect<
    TSuccess,
    NoInfer<TWireError>,
    Layer.Success<typeof applicationLayer>
  >;
  errors: readonly Schema.Schema<TWireError>[];
  signal: AbortSignal | undefined;
}) {
  const exit = await context.runtime.runPromiseExit(
    context.req === undefined
      ? effect
      : Effect.provideService(effect, PinoLogger, context.req.log),
    { signal },
  );

  if (Exit.isSuccess(exit)) {
    return exit.value;
  }

  // A client that disconnects interrupts the Effect, so the outcome of the
  // call is unknown: a COMMIT already sent to PostgreSQL can still complete
  // (https://www.postgresql.org/docs/current/protocol-flow.html#PROTOCOL-FLOW-CANCELING-REQUESTS).
  if (Cause.hasInterruptsOnly(exit.cause)) {
    throw new TRPCError({
      cause: Cause.squash(exit.cause),
      code: "CLIENT_CLOSED_REQUEST",
    });
  }

  const wireError = Option.filter(
    Cause.findErrorOption(exit.cause),
    Schema.is(wireErrorSchema),
  );

  if (Option.isSome(wireError)) {
    const wireErrorCode = getWireErrorCode(wireError.value);

    throw new TRPCError({
      cause: wireError.value,
      code: wireErrorCode,
      message: wireErrorCode,
    });
  }

  throw new TRPCError({
    cause: Cause.squash(exit.cause),
    code: "INTERNAL_SERVER_ERROR",
  });
}
