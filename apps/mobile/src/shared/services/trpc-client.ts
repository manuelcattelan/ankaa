import type * as Schema from "effect/Schema";

import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import type { TrpcClientError } from "#/shared/errors/trpc-client-error.ts";
import type { TrpcRequest } from "#/shared/services/make-trpc-client.ts";

import { apiUrlSchema } from "#/shared/core/api-url-schema.ts";
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
  }
>()("@ankaa/mobile/shared/services/TrpcClient") {
  static readonly layerNoDeps = Layer.effect(
    TrpcClient,
    Effect.gen(function* () {
      const apiUrl = yield* Config.schema(apiUrlSchema, "EXPO_PUBLIC_API_URL");
      const authenticationClient = yield* AuthenticationClient;

      return TrpcClient.of(
        makeTrpcClient({
          apiUrl,
          authClient: authenticationClient.authClient,
          fetch,
        }),
      );
    }),
  );

  static readonly layer = TrpcClient.layerNoDeps.pipe(
    Layer.provide(AuthenticationClient.layer),
  );
}
