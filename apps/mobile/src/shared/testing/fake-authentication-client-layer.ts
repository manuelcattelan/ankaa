import * as Layer from "effect/Layer";

import { AuthenticationClient } from "#/shared/services/authentication-client.ts";
import { makeAuthenticationClient } from "#/shared/services/make-authentication-client.ts";
import { FAKE_API_URL } from "#/shared/testing/fake-api-url.ts";

export type FakeAuthenticationResponses = Partial<
  Record<string, (request: Request) => Promise<Response> | Response>
>;

const HTTP_STATUS_NOT_FOUND = 404;

/**
 * Answers the real better-auth client's requests from
 * `fakeAuthenticationResponses`, keyed by path, and keeps its storage in
 * memory. Nobody is signed in unless a response for `/get-session` says so.
 */
export function fakeAuthenticationClientLayer(
  fakeAuthenticationResponses: FakeAuthenticationResponses,
) {
  return Layer.sync(AuthenticationClient, () => {
    const authenticationStorageItems = new Map<string, string>();

    return AuthenticationClient.of(
      makeAuthenticationClient({
        apiUrl: FAKE_API_URL,
        fetch: (input, options) =>
          answerFakeAuthenticationRequest({
            request: new Request(input, options),
            responses: {
              "/get-session": () => Response.json(null),
              ...fakeAuthenticationResponses,
            },
          }),
        storage: {
          getItem: (key) => authenticationStorageItems.get(key) ?? null,
          getItemAsync: (key) =>
            Promise.resolve(authenticationStorageItems.get(key) ?? null),
          setItem: (key, item) => {
            authenticationStorageItems.set(key, item);
          },
          setItemAsync: (key, item) => {
            authenticationStorageItems.set(key, item);

            return Promise.resolve();
          },
        },
      }),
    );
  });
}

function answerFakeAuthenticationRequest({
  request,
  responses,
}: {
  request: Request;
  responses: FakeAuthenticationResponses;
}) {
  const fakeAuthenticationResponse =
    responses[new URL(request.url).pathname.replace("/api/auth", "")];

  if (fakeAuthenticationResponse === undefined) {
    return Promise.resolve(
      new Response(null, { status: HTTP_STATUS_NOT_FOUND }),
    );
  }

  return Promise.resolve(fakeAuthenticationResponse(request));
}
