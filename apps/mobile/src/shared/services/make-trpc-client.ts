import type { AppRouter } from "@ankaa/api/trpc/app-router";
import type { TRPCClient } from "@trpc/client";
import type * as Schema from "effect/Schema";

import * as Effect from "effect/Effect";

import { TrpcError } from "#/shared/errors/trpc-error.ts";

type TrpcRequest<TData> = {
  call: (callOptions: {
    signal: AbortSignal;
    vanillaTrpcClient: TRPCClient<AppRouter>;
  }) => Promise<TData>;
  errors: readonly Schema.Top[];
};

/**
 * Builds the `TrpcClient` Service over a vanilla tRPC client, so the app and
 * the fake in `#/shared/testing/` run the same `request` and differ only in
 * the client's link.
 */
export function makeTrpcClient(vanillaTrpcClient: TRPCClient<AppRouter>) {
  function request<TData>({ call }: TrpcRequest<TData>) {
    return Effect.tryPromise({
      catch: (cause) => new TrpcError({ cause }),
      try: (signal) => call({ signal, vanillaTrpcClient }),
    });
  }

  return { request, vanillaTrpcClient };
}
