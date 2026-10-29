import type { ExpoClientStorage } from "@better-auth/expo/client";

import { expoClient } from "@better-auth/expo/client";
import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import * as Effect from "effect/Effect";

import { AuthenticationClientError } from "#/shared/errors/authentication-client-error.ts";

type AuthClient = ReturnType<typeof buildAuthClient>;

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
  code?: string | undefined;
  message?: string | undefined;
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

type MakeAuthenticationClientOptions = {
  apiUrl: string;
  fetch: AuthenticationFetch;
  storage: ExpoClientStorage;
};

type SendAuthenticationRequest<TData> = (
  authClient: AuthClient,
  fetchOptions: AuthenticationFetchOptions,
) => Promise<AuthenticationResponse<TData>>;

const APPLICATION_SLUG = "ankaa";

/**
 * Builds the `AuthenticationClient` Service over the better-auth client, so
 * the app and the fake in `#/shared/testing/` run the same client and differ
 * only in its fetch and storage.
 */
export function makeAuthenticationClient({
  apiUrl,
  fetch,
  storage,
}: MakeAuthenticationClientOptions) {
  const authClient = buildAuthClient({ apiUrl, fetch, storage });

  function request<TData>(sendRequest: SendAuthenticationRequest<TData>) {
    return Effect.tryPromise({
      catch: (cause) =>
        new AuthenticationClientError({
          cause,
          code: null,
          retryAfterSeconds: null,
          status: null,
        }),
      try: async () => {
        let retryAfterSeconds: null | number = null;

        const response = await sendRequest(authClient, {
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
              new AuthenticationClientError({
                code: authenticationRequest.response.error.code ?? null,
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

  return { apiUrl, authClient, request };
}

function buildAuthClient({
  apiUrl,
  fetch,
  storage,
}: MakeAuthenticationClientOptions) {
  return createAuthClient({
    baseURL: apiUrl,
    fetchOptions: { customFetchImpl: fetch },
    plugins: [
      expoClient({
        scheme: APPLICATION_SLUG,
        storage,
        storagePrefix: APPLICATION_SLUG,
      }),
      emailOTPClient(),
    ],
  });
}
