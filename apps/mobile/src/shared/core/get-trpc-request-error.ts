import type { AppRouter } from "@ankaa/api/trpc/app-router";

import { isTRPCClientError } from "@trpc/client";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";

import { TrpcClientError } from "#/shared/errors/trpc-client-error.ts";

/**
 * Maps the failure of a tRPC call to the Wire error that the server encoded,
 * when it's one of `errors`, the procedure's list, or to a `TrpcClientError`
 * for every other failure.
 */
export function getTrpcRequestError<TWireError>({
  cause,
  errors,
}: {
  cause: unknown;
  errors: readonly Schema.Decoder<TWireError>[];
}) {
  const wireError = isTRPCClientError<AppRouter>(cause)
    ? Schema.decodeUnknownOption(Schema.Union(errors))(cause.data?.wireError)
    : Option.none();

  return Option.getOrElse(wireError, () => new TrpcClientError({ cause }));
}
