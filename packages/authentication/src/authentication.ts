import { Email } from "@ankaa/email/email";
import { betterAuth } from "better-auth";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { AuthenticationError } from "#/authentication-error.ts";
import { loadAuthenticationOptions } from "#/load-authentication-options.ts";

export class Authentication extends Context.Service<Authentication>()(
  "@ankaa/authentication/Authentication",
  {
    make: Effect.gen(function* () {
      const authenticationOptions = yield* loadAuthenticationOptions();

      const betterAuthentication = betterAuth(authenticationOptions);

      function request<TResponse>(execute: () => Promise<TResponse>) {
        return Effect.tryPromise({
          catch: (cause) => new AuthenticationError({ cause }),
          try: execute,
        });
      }

      yield* request(() => betterAuthentication.$context);

      function getSession(headers: Headers) {
        return request(() => betterAuthentication.api.getSession({ headers }));
      }

      function handleRequest(webRequest: Request) {
        return request(() => betterAuthentication.handler(webRequest));
      }

      return { getSession, handleRequest };
    }),
  },
) {
  static readonly layerNoDeps = Layer.effect(this, this.make);

  static readonly layer = this.layerNoDeps.pipe(Layer.provide(Email.layer));
}
