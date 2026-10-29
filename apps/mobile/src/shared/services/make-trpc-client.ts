import type { AppRouter } from "@ankaa/api/trpc/app-router";
import type { TRPCClient } from "@trpc/client";
import type * as Schema from "effect/Schema";

import * as Effect from "effect/Effect";

import { getTrpcRequestError } from "#/shared/core/get-trpc-request-error.ts";

export type TrpcRequest<
  TData,
  TWireErrors extends readonly Schema.Decoder<unknown>[],
> = {
  call: (callOptions: {
    signal: AbortSignal;
    trpc: TRPCClient<AppRouter>;
  }) => Promise<TData>;
  errors: TWireErrors;
};

/**
 * Builds the implementation of the `TrpcClient` Service over a vanilla tRPC
 * client, so the Service's Layer and the fake in `#/shared/testing/` run the
 * same `request` and differ only in the client's link.
 */
export function makeTrpcClient(trpc: TRPCClient<AppRouter>) {
  function request<
    TData,
    TWireErrors extends readonly Schema.Decoder<unknown>[],
  >({ call, errors }: TrpcRequest<TData, TWireErrors>) {
    return Effect.tryPromise({
      catch: (cause) => getTrpcRequestError({ cause, errors }),
      try: (signal) => call({ signal, trpc }),
    });
  }

  return { request, trpc };
}
