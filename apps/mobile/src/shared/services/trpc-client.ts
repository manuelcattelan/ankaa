import type { AppRouter } from "@ankaa/api/trpc/app-router";

import { createTRPCClient, httpBatchLink } from "@trpc/client";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { AuthenticationClient } from "#/shared/services/authentication-client.ts";
import { makeTrpcClient } from "#/shared/services/make-trpc-client.ts";

export class TrpcClient extends Context.Service<TrpcClient>()(
  "@ankaa/mobile/shared/services/TrpcClient",
  {
    make: Effect.gen(function* () {
      const authenticationClient = yield* AuthenticationClient;

      return makeTrpcClient(
        createTRPCClient<AppRouter>({
          links: [
            httpBatchLink({
              fetch: (url, options) =>
                fetch(url, { ...options, credentials: "omit" }),
              headers: async () => {
                const cookies =
                  await authenticationClient.authClient.getCookie();

                return cookies ? { cookie: cookies } : {};
              },
              url: `${authenticationClient.apiUrl}/trpc`,
            }),
          ],
        }),
      );
    }),
  },
) {
  static readonly layerNoDeps = Layer.effect(this, this.make);

  static readonly layer = this.layerNoDeps.pipe(
    Layer.provide(AuthenticationClient.layer),
  );
}
