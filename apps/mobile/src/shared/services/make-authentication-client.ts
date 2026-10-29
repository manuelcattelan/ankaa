import type { ExpoClientStorage } from "@better-auth/expo/client";

import { expoClient } from "@better-auth/expo/client";
import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import * as Effect from "effect/Effect";

import { getAuthenticationResponseError } from "#/shared/core/get-authentication-response-error.ts";
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
      error: { code?: string | undefined; status: number };
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
      catch: (cause) => new AuthenticationClientError({ cause }),
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
      Effect.flatMap(({ response, retryAfterHeader }) => {
        if (response.error === null) {
          return Effect.succeed(response.data);
        }

        const responseError = getAuthenticationResponseError({
          code: response.error.code ?? null,
          retryAfterHeader,
          status: response.error.status,
        });

        return responseError === null
          ? Effect.die(response.error)
          : Effect.fail(responseError);
      }),
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
