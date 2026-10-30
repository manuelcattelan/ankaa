import type { Auth } from "better-auth";

import { Email } from "@ankaa/email/email";
import { betterAuth } from "better-auth";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as FetchHttpClient from "effect/http/FetchHttpClient";
import * as Layer from "effect/Layer";

import type { AuthenticationError } from "#/authentication-error.ts";
import type { createAuthenticationOptions } from "#/create-authentication-options.ts";

import { loadAuthenticationOptions } from "#/load-authentication-options.ts";
import { makeAuthentication } from "#/make-authentication.ts";

export class Authentication extends Context.Service<
  Authentication,
  {
    readonly getSession: (
      headers: Headers,
    ) => Effect.Effect<
      | Auth<
          ReturnType<typeof createAuthenticationOptions>
        >["$Infer"]["Session"]
      | null,
      AuthenticationError
    >;
    readonly handleRequest: (
      request: Request,
    ) => Effect.Effect<Response, AuthenticationError>;
  }
>()("@ankaa/authentication/Authentication") {
  static readonly layerNoDeps = Layer.effect(
    Authentication,
    Effect.gen(function* () {
      const authenticationOptions = yield* loadAuthenticationOptions();

      const authentication = yield* makeAuthentication(
        betterAuth(authenticationOptions),
      );

      return Authentication.of(authentication);
    }),
  );

  static readonly layer = Authentication.layerNoDeps.pipe(
    Layer.provide(Layer.mergeAll(Email.layer, FetchHttpClient.layer)),
  );
}
