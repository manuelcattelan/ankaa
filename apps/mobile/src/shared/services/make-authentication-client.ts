import type { ExpoClientStorage } from "@better-auth/expo/client";

import { expoClient } from "@better-auth/expo/client";
import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import * as Effect from "effect/Effect";

import type { AuthenticationResponseError } from "#/shared/core/build-authentication-client-error.ts";

import { buildAuthenticationClientError } from "#/shared/core/build-authentication-client-error.ts";
import { AuthenticationClientError } from "#/shared/errors/authentication-client-error.ts";

export type AuthClient = ReturnType<typeof buildAuthClient>;

export type SendAuthenticationRequest<TData> = (requestOptions: {
  authClient: AuthClient;
  fetchOptions: {
    onError: (context: { response: Response }) => void;
  };
}) => Promise<AuthenticationResponse<TData>>;

type AuthenticationFetch = (
  input: Request | string | URL,
  options?: RequestInit,
) => Promise<Response>;

type AuthenticationResponse<TData> =
  | {
      data: null;
      error: AuthenticationResponseError;
    }
  | {
      data: TData;
      error: null;
    };

type MakeAuthenticationClientOptions = {
  apiUrl: string;
  fetch: AuthenticationFetch;
  storage: ExpoClientStorage;
};

const APPLICATION_SLUG = "ankaa";

/**
 * Builds the implementation of the `AuthenticationClient` Service over the
 * better-auth client, so the Service's Layer and the fake in
 * `#/shared/testing/` run the same client and differ only in its fetch and
 * storage.
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
          message: "Failed to send the authentication request",
          retryAfterSeconds: null,
          status: null,
        }),
      try: async () => {
        let retryAfterHeader: null | string = null;

        const response = await sendRequest({
          authClient,
          fetchOptions: {
            onError: (context) => {
              retryAfterHeader = context.response.headers.get("X-Retry-After");
            },
          },
        });

        return { response, retryAfterHeader };
      },
    }).pipe(
      Effect.flatMap((authenticationRequest) =>
        authenticationRequest.response.error !== null
          ? Effect.fail(
              buildAuthenticationClientError({
                error: authenticationRequest.response.error,
                retryAfterHeader: authenticationRequest.retryAfterHeader,
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
