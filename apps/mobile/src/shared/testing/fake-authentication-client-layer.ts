import * as Layer from "effect/Layer";

import { convertUndefinedToNull } from "#/shared/core/convert-undefined-to-null.ts";
import { AuthenticationClient } from "#/shared/services/authentication-client.ts";
import { makeAuthenticationClient } from "#/shared/services/make-authentication-client.ts";

export type FakeAuthenticationResponses = Partial<
  Record<string, (request: Request) => Promise<Response> | Response>
>;

type AnswerFakeAuthenticationRequestOptions = {
  fakeAuthenticationResponses: FakeAuthenticationResponses;
  request: Request;
};

const FAKE_API_URL = "https://api.ankaa.test";

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
        authenticationFetch: (input, options) =>
          answerFakeAuthenticationRequest({
            fakeAuthenticationResponses: {
              "/get-session": () =>
                Response.json(convertUndefinedToNull(undefined)),
              ...fakeAuthenticationResponses,
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
    );
  });
}

function answerFakeAuthenticationRequest({
  fakeAuthenticationResponses,
  request,
}: AnswerFakeAuthenticationRequestOptions) {
  const fakeAuthenticationResponse =
    fakeAuthenticationResponses[
      new URL(request.url).pathname.replace("/api/auth", "")
    ];

  if (!fakeAuthenticationResponse) {
    return Promise.resolve(
      new Response(undefined, { status: HTTP_STATUS_NOT_FOUND }),
    );
  }

  return Promise.resolve(fakeAuthenticationResponse(request));
}
