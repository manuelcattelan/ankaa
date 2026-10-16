import { expoClient } from "@better-auth/expo/client";
import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ExpoSecureStore from "expo-secure-store";

import { apiUrlSchema } from "@/shared/core/api-url-schema";
import { AuthenticationError } from "@/shared/errors/authentication-error";

type AuthenticationFetchErrorContext = {
  response: Response;
};

type AuthenticationFetchOptions = {
  onError: (context: AuthenticationFetchErrorContext) => void;
};

type AuthenticationResponse<TData> =
  AuthenticationResponseFailure | AuthenticationResponseSuccess<TData>;

type AuthenticationResponseError = {
  code?: string;
  message?: string;
  status: number;
  statusText: string;
};

type AuthenticationResponseFailure = {
  data: null;
  error: AuthenticationResponseError;
};

type AuthenticationResponseSuccess<TData> = {
  data: TData;
  error: null;
};

type BetterAuthenticationClient = ReturnType<
  typeof createBetterAuthenticationClient
>;

type SendAuthenticationRequest<TData> = (
  betterAuthenticationClient: BetterAuthenticationClient,
  fetchOptions: AuthenticationFetchOptions,
) => Promise<AuthenticationResponse<TData>>;

const APP_SLUG = "ankaa";

const SECURE_STORE_OPTIONS: ExpoSecureStore.SecureStoreOptions = {
  keychainAccessible: ExpoSecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export class AuthenticationClient extends Context.Service<AuthenticationClient>()(
  "@ankaa/mobile/shared/services/AuthenticationClient",
  {
    make: Effect.gen(function* () {
      const apiUrl = yield* Config.schema(apiUrlSchema, "EXPO_PUBLIC_API_URL");

      const betterAuthenticationClient =
        createBetterAuthenticationClient(apiUrl);

      function request<TData>(sendRequest: SendAuthenticationRequest<TData>) {
        return Effect.tryPromise({
          catch: (cause) => new AuthenticationError({ cause }),
          try: async () => {
            let retryAfterSeconds: number | undefined;

            const response = await sendRequest(betterAuthenticationClient, {
              onError: (context) => {
                const retryAfterHeader =
                  context.response.headers.get("X-Retry-After");

                if (retryAfterHeader) {
                  retryAfterSeconds = Number(retryAfterHeader);
                }
              },
            });

            return { response, retryAfterSeconds };
          },
        }).pipe(
          Effect.flatMap((authenticationRequest) =>
            authenticationRequest.response.error
              ? Effect.fail(
                  new AuthenticationError({
                    code: authenticationRequest.response.error.code,
                    message:
                      authenticationRequest.response.error.message ??
                      authenticationRequest.response.error.statusText,
                    retryAfterSeconds: authenticationRequest.retryAfterSeconds,
                    status: authenticationRequest.response.error.status,
                  }),
                )
              : Effect.succeed(authenticationRequest.response.data),
          ),
        );
      }

      return { betterAuthenticationClient, request };
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make);
}

function createBetterAuthenticationClient(apiUrl: string) {
  return createAuthClient({
    baseURL: apiUrl,
    plugins: [
      expoClient({
        scheme: APP_SLUG,
        storage: {
          getItem: (key) => ExpoSecureStore.getItem(key, SECURE_STORE_OPTIONS),
          getItemAsync: (key) =>
            ExpoSecureStore.getItemAsync(key, SECURE_STORE_OPTIONS),
          setItem: (key, item) =>
            ExpoSecureStore.setItem(key, item, SECURE_STORE_OPTIONS),
          setItemAsync: (key, item) =>
            ExpoSecureStore.setItemAsync(key, item, SECURE_STORE_OPTIONS),
        },
        storagePrefix: APP_SLUG,
      }),
      emailOTPClient(),
    ],
  });
}
