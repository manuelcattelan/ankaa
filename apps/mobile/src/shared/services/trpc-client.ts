import type { AppRouter } from "@ankaa/api/trpc/app-router";
import type { TRPCClient } from "@trpc/client";
import type * as Schema from "effect/Schema";

import { createTRPCClient, httpBatchLink } from "@trpc/client";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import type { TrpcClientError } from "#/shared/errors/trpc-client-error.ts";
import type { TrpcRequest } from "#/shared/services/make-trpc-client.ts";

import { AuthenticationClient } from "#/shared/services/authentication-client.ts";
import { makeTrpcClient } from "#/shared/services/make-trpc-client.ts";

export class TrpcClient extends Context.Service<
  TrpcClient,
  {
    readonly request: <
      TData,
      TWireErrors extends readonly Schema.Decoder<unknown>[],
    >(
      request: TrpcRequest<TData, TWireErrors>,
    ) => Effect.Effect<TData, TrpcClientError | TWireErrors[number]["Type"]>;
    readonly trpc: TRPCClient<AppRouter>;
  }
>()("@ankaa/mobile/shared/services/TrpcClient") {
  static readonly layerNoDeps = Layer.effect(
    TrpcClient,
    Effect.gen(function* () {
      const authenticationClient = yield* AuthenticationClient;

      return TrpcClient.of(
        makeTrpcClient({
          authClient: authenticationClient.authClient,
          trpc: createTRPCClient<AppRouter>({
            links: [
              httpBatchLink({
                fetch: (url, options) =>
                  fetch(url, {
                    ...options,
                    credentials: "omit",
                    signal: options?.signal ?? null,
                  }),
                headers: async () => {
                  const cookies =
                    await authenticationClient.authClient.getCookie();

                  return cookies === "" ? {} : { cookie: cookies };
                },
                url: `${authenticationClient.apiUrl}/trpc`,
              }),
            ],
          }),
        }),
      );
    }),
  );

  static readonly layer = TrpcClient.layerNoDeps.pipe(
    Layer.provide(AuthenticationClient.layer),
  );
}
