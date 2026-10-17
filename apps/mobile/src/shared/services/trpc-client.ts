import type { AppRouter } from "@ankaa/api/trpc/router";
import type { TRPCClient } from "@trpc/client";

import { createTRPCClient, httpBatchLink } from "@trpc/client";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { TrpcError } from "@/shared/errors/trpc-error";
import { AuthenticationClient } from "@/shared/services/authentication-client";

type SendTrpcRequest<TData> = (
  vanillaTrpcClient: TRPCClient<AppRouter>,
) => Promise<TData>;

export class TrpcClient extends Context.Service<TrpcClient>()(
  "@ankaa/mobile/shared/services/TrpcClient",
  {
    make: Effect.gen(function* () {
      const authenticationClient = yield* AuthenticationClient;

      const vanillaTrpcClient = createTRPCClient<AppRouter>({
        links: [
          httpBatchLink({
            fetch: (url, options) =>
              fetch(url, { ...options, credentials: "omit" }),
            headers: async () => {
              const cookies =
                await authenticationClient.betterAuthenticationClient.getCookie();

              return cookies ? { cookie: cookies } : {};
            },
            url: `${authenticationClient.apiUrl}/trpc`,
          }),
        ],
      });

      function request<TData>(sendRequest: SendTrpcRequest<TData>) {
        return Effect.tryPromise({
          catch: (cause) => new TrpcError({ cause }),
          try: () => sendRequest(vanillaTrpcClient),
        });
      }

      return { request, vanillaTrpcClient };
    }),
  },
) {
  static readonly layerNoDeps = Layer.effect(this, this.make);

  static readonly layer = this.layerNoDeps.pipe(
    Layer.provide(AuthenticationClient.layer),
  );
}
