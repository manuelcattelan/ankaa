import type { AppRouter } from "@ankaa/api/trpc/app-router";
import type { TRPCClient } from "@trpc/client";
import type * as Schema from "effect/Schema";

import * as Effect from "effect/Effect";

import type { AuthClient } from "#/shared/services/make-authentication-client.ts";

import { getTrpcRequestError } from "#/shared/core/get-trpc-request-error.ts";
import { isTrpcCallUnauthorized } from "#/shared/core/is-trpc-call-unauthorized.ts";

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
 * same `request` and differ only in the client's link. A call that the server
 * rejects as unauthorized refetches the session, so the app learns that the
 * session is gone and routes the User to sign-in.
 */
export function makeTrpcClient({
  authClient,
  trpc,
}: {
  authClient: AuthClient;
  trpc: TRPCClient<AppRouter>;
}) {
  function refetchSession() {
    // better-auth's session atom refetches whenever this signal changes
    // (https://github.com/better-auth/better-auth/blob/v1.7.5/packages/better-auth/src/client/session-refresh.ts).
    authClient.$store.notify("$sessionSignal");
  }

  function request<
    TData,
    TWireErrors extends readonly Schema.Decoder<unknown>[],
  >({ call, errors }: TrpcRequest<TData, TWireErrors>) {
    return Effect.tryPromise({
      catch: (cause) => cause,
      try: (signal) => call({ signal, trpc }),
    }).pipe(
      Effect.tapError((cause) =>
        isTrpcCallUnauthorized(cause)
          ? Effect.sync(refetchSession)
          : Effect.void,
      ),
      Effect.mapError((cause) => getTrpcRequestError({ cause, errors })),
    );
  }

  return { request, trpc };
}
