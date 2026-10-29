import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ExpoSecureStore from "expo-secure-store";

import { apiUrlSchema } from "#/shared/core/api-url-schema.ts";
import { makeAuthenticationClient } from "#/shared/services/make-authentication-client.ts";

const SECURE_STORE_OPTIONS: ExpoSecureStore.SecureStoreOptions = {
  keychainAccessible: ExpoSecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export class AuthenticationClient extends Context.Service<AuthenticationClient>()(
  "@ankaa/mobile/shared/services/AuthenticationClient",
  {
    make: Effect.gen(function* () {
      const apiUrl = yield* Config.schema(apiUrlSchema, "EXPO_PUBLIC_API_URL");

      return makeAuthenticationClient({
        apiUrl,
        authenticationFetch: fetch,
        authenticationStorage: {
          getItem: (key) => ExpoSecureStore.getItem(key, SECURE_STORE_OPTIONS),
          getItemAsync: (key) =>
            ExpoSecureStore.getItemAsync(key, SECURE_STORE_OPTIONS),
          setItem: (key, item) =>
            ExpoSecureStore.setItem(key, item, SECURE_STORE_OPTIONS),
          setItemAsync: (key, item) =>
            ExpoSecureStore.setItemAsync(key, item, SECURE_STORE_OPTIONS),
        },
      });
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make);
}
