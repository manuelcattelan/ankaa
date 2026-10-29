import type { ExpoClientStorage } from "@better-auth/expo/client";

import { expoClient } from "@better-auth/expo/client";
import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import * as Effect from "effect/Effect";

import { AuthenticationError } from "#/shared/errors/authentication-error.ts";

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

type MakeAuthenticationClientOptions = {
  apiUrl: string;
  authenticationFetch: AuthenticationFetch;
  authenticationStorage: ExpoClientStorage;
};

type SendAuthenticationRequest<TData> = (
  betterAuthenticationClient: BetterAuthenticationClient,
  fetchOptions: AuthenticationFetchOptions,
) => Promise<AuthenticationResponse<TData>>;

const APP_SLUG = "ankaa";

/**
 * Builds the `AuthenticationClient` Service over the better-auth client, so
 * the app and the fake in `#/shared/testing/` run the same client and differ
 * only in its fetch and storage.
 */
export function makeAuthenticationClient({
  apiUrl,
  authenticationFetch,
  authenticationStorage,
}: MakeAuthenticationClientOptions) {
  const betterAuthenticationClient = createBetterAuthenticationClient({
    apiUrl,
    authenticationFetch,
    authenticationStorage,
  });

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
}: MakeAuthenticationClientOptions) {
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
