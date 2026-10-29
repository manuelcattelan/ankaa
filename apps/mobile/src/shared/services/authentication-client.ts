import type { ExpoClientStorage } from "@better-auth/expo/client";

import { expoClient } from "@better-auth/expo/client";
import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ExpoSecureStore from "expo-secure-store";

import { apiUrlSchema } from "#/shared/core/api-url-schema.ts";
import { convertUndefinedToNull } from "#/shared/core/convert-undefined-to-null.ts";
import { AuthenticationError } from "#/shared/errors/authentication-error.ts";

export type AuthenticationTestResponses = Partial<
  Record<string, (request: Request) => Promise<Response> | Response>
>;

type AnswerAuthenticationTestRequestOptions = {
  authenticationTestResponses: AuthenticationTestResponses;
  request: Request;
};

type AuthenticationFetch = (
  input: Request | string | URL,
  options?: RequestInit,
) => Promise<Response>;

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

type CreateAuthenticationClientServiceOptions = {
  apiUrl: string;
  betterAuthenticationClient: BetterAuthenticationClient;
};

type CreateBetterAuthenticationClientOptions = {
  apiUrl: string;
  authenticationFetch: AuthenticationFetch;
  authenticationStorage: ExpoClientStorage;
};

type SendAuthenticationRequest<TData> = (
  betterAuthenticationClient: BetterAuthenticationClient,
  fetchOptions: AuthenticationFetchOptions,
) => Promise<AuthenticationResponse<TData>>;

const APP_SLUG = "ankaa";

const TEST_API_URL = "https://api.ankaa.test";

const HTTP_STATUS_NOT_FOUND = 404;

const SECURE_STORE_OPTIONS: ExpoSecureStore.SecureStoreOptions = {
  keychainAccessible: ExpoSecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export class AuthenticationClient extends Context.Service<AuthenticationClient>()(
  "@ankaa/mobile/shared/services/AuthenticationClient",
  {
    make: Effect.gen(function* () {
      const apiUrl = yield* Config.schema(apiUrlSchema, "EXPO_PUBLIC_API_URL");

      return createAuthenticationClientService({
        apiUrl,
        betterAuthenticationClient: createBetterAuthenticationClient({
          apiUrl,
          authenticationFetch: fetch,
          authenticationStorage: {
            getItem: (key) =>
              ExpoSecureStore.getItem(key, SECURE_STORE_OPTIONS),
            getItemAsync: (key) =>
              ExpoSecureStore.getItemAsync(key, SECURE_STORE_OPTIONS),
            setItem: (key, item) =>
              ExpoSecureStore.setItem(key, item, SECURE_STORE_OPTIONS),
            setItemAsync: (key, item) =>
              ExpoSecureStore.setItemAsync(key, item, SECURE_STORE_OPTIONS),
          },
        }),
      });
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make);

  static readonly layerTest = (
    authenticationTestResponses: AuthenticationTestResponses,
  ) =>
    Layer.sync(this, () => {
      const authenticationStorageItems = new Map<string, string>();

      return this.of(
        createAuthenticationClientService({
          apiUrl: TEST_API_URL,
          betterAuthenticationClient: createBetterAuthenticationClient({
            apiUrl: TEST_API_URL,
            authenticationFetch: (input, options) =>
              answerAuthenticationTestRequest({
                authenticationTestResponses: {
                  "/get-session": () =>
                    Response.json(convertUndefinedToNull(undefined)),
                  ...authenticationTestResponses,
                },
                request: new Request(input, options),
              }),
            authenticationStorage: {
              getItem: (key) =>
                convertUndefinedToNull(authenticationStorageItems.get(key)),
              getItemAsync: (key) =>
                Promise.resolve(
                  convertUndefinedToNull(authenticationStorageItems.get(key)),
                ),
              setItem: (key, item) => {
                authenticationStorageItems.set(key, item);
              },
              setItemAsync: (key, item) => {
                authenticationStorageItems.set(key, item);

                return Promise.resolve();
              },
            },
          }),
        }),
      );
    });
}

function answerAuthenticationTestRequest({
  authenticationTestResponses,
  request,
}: AnswerAuthenticationTestRequestOptions) {
  const authenticationTestResponse =
    authenticationTestResponses[
      new URL(request.url).pathname.replace("/api/auth", "")
    ];

  if (!authenticationTestResponse) {
    return Promise.resolve(
      new Response(undefined, { status: HTTP_STATUS_NOT_FOUND }),
    );
  }

  return Promise.resolve(authenticationTestResponse(request));
}

function createAuthenticationClientService({
  apiUrl,
  betterAuthenticationClient,
}: CreateAuthenticationClientServiceOptions) {
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

  return { apiUrl, betterAuthenticationClient, request };
}

function createBetterAuthenticationClient({
  apiUrl,
  authenticationFetch,
  authenticationStorage,
}: CreateBetterAuthenticationClientOptions) {
  return createAuthClient({
    baseURL: apiUrl,
    fetchOptions: { customFetchImpl: authenticationFetch },
    plugins: [
      expoClient({
        scheme: APP_SLUG,
        storage: authenticationStorage,
        storagePrefix: APP_SLUG,
      }),
      emailOTPClient(),
    ],
  });
}
