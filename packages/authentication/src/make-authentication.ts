import type { Auth } from "better-auth";

import * as Effect from "effect/Effect";

import type { createAuthenticationOptions } from "#/create-authentication-options.ts";

import { AuthenticationError } from "#/authentication-error.ts";

type BetterAuth = {
  $context: Promise<unknown>;
  api: Pick<
    Auth<ReturnType<typeof createAuthenticationOptions>>["api"],
    "getSession"
  >;
  handler: (request: Request) => Promise<Response>;
};

export const makeAuthentication = Effect.fn("makeAuthentication")(function* (
  auth: BetterAuth,
) {
  function request<TResponse>(execute: () => Promise<TResponse>) {
    return Effect.tryPromise({
      catch: (cause) => new AuthenticationError({ cause }),
      try: execute,
    });
  }

  yield* request(() => auth.$context);

  function getSession(headers: Headers) {
    return request(() => auth.api.getSession({ headers }));
  }

  function handleRequest(webRequest: Request) {
    return request(() => auth.handler(webRequest));
  }

  return { getSession, handleRequest };
});
