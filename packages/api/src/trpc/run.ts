import type { Authentication } from "@ankaa/authentication";
import type { Database } from "@ankaa/database";
import type { TRPC_ERROR_CODE_KEY } from "@trpc/server";

import { CurrentSession } from "@ankaa/authentication/current-session";
import { TRPCError } from "@trpc/server";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Result from "effect/Result";

import type { ApplicationRuntime } from "./context.ts";

type RunContext = {
  runtime: ApplicationRuntime;
  session: CurrentSession["Service"];
};

type RunOptions<TSuccess, TError> = {
  context: RunContext;
  effect: Effect.Effect<
    TSuccess,
    TError,
    Authentication | CurrentSession | Database
  >;
  getErrorCode: (error: TError) => TRPC_ERROR_CODE_KEY;
  signal: AbortSignal | undefined;
};

export async function run<TSuccess, TError>({
  context,
  effect,
  getErrorCode,
  signal,
}: RunOptions<TSuccess, TError>) {
  const exit = await context.runtime.runPromiseExit(
    effect.pipe(
      Effect.provideService(CurrentSession, context.session),
      Effect.result,
    ),
    { signal },
  );

  if (Exit.isFailure(exit)) {
    throw new TRPCError({
      cause: Cause.squash(exit.cause),
      code: "INTERNAL_SERVER_ERROR",
    });
  }

  if (Result.isFailure(exit.value)) {
    const errorCode = getErrorCode(exit.value.failure);

    throw new TRPCError({
      cause: exit.value.failure,
      code: errorCode,
      message: errorCode,
    });
  }

  return exit.value.success;
}
