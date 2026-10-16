import type { AppRouter } from "@ankaa/api/trpc/router";

import { createTRPCClient, httpBatchLink } from "@trpc/client";
import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { apiUrlSchema } from "@/shared/core/api-url-schema";
import { AuthenticationClient } from "@/shared/services/authentication-client";

export class TrpcClient extends Context.Service<TrpcClient>()(
  "@ankaa/mobile/shared/services/TrpcClient",
  {
    make: Effect.gen(function* () {
      const authenticationClient = yield* AuthenticationClient;

      const apiUrl = yield* Config.schema(apiUrlSchema, "EXPO_PUBLIC_API_URL");

      return createTRPCClient<AppRouter>({
        links: [
          httpBatchLink({
            fetch: (url, options) =>
              fetch(url, { ...options, credentials: "omit" }),
            headers: async () => {
              const cookies = await authenticationClient.getCookie();

              return cookies ? { cookie: cookies } : {};
            },
            url: `${apiUrl}/trpc`,
          }),
        ],
      });
    }),
  },
) {
  static readonly layerNoDeps = Layer.effect(this, this.make);

  static readonly layer = this.layerNoDeps.pipe(
    Layer.provide(AuthenticationClient.layer),
  );
}
