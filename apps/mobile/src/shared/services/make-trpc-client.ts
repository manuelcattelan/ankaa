import type { AppRouter } from "@ankaa/api/trpc/app-router";
import type { TRPCClient } from "@trpc/client";
import type * as Schema from "effect/Schema";

import * as Effect from "effect/Effect";

import { TrpcClientError } from "#/shared/errors/trpc-client-error.ts";

export type TrpcRequest<TData> = {
  call: (callOptions: {
    signal: AbortSignal;
    trpc: TRPCClient<AppRouter>;
  }) => Promise<TData>;
  errors: readonly Schema.Top[];
};

/**
 * Builds the implementation of the `TrpcClient` Service over a vanilla tRPC
 * client, so the Service's Layer and the fake in `#/shared/testing/` run the
 * same `request` and differ only in the client's link.
 */
export function makeTrpcClient(trpc: TRPCClient<AppRouter>) {
  function request<TData>({ call }: TrpcRequest<TData>) {
    return Effect.tryPromise({
      catch: (cause) => new TrpcClientError({ cause }),
      try: (signal) => call({ signal, trpc }),
    });
  }

  return { request, trpc };
}
