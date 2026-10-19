import { Database } from "@ankaa/database";
import { Email } from "@ankaa/email";
import { betterAuth } from "better-auth";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";

import { authenticationConfiguration } from "./authentication-configuration.ts";
import { createAuthenticationOptions } from "./create-authentication-options.ts";
import { AuthenticationError } from "./error.ts";

export class Authentication extends Context.Service<Authentication>()(
  "@ankaa/authentication/Authentication",
  {
    make: Effect.gen(function* () {
      const database = yield* Database;
      const email = yield* Email;

      const authenticationSettings = yield* authenticationConfiguration;

      const context = yield* Effect.context();

      const betterAuthentication = betterAuth(
        createAuthenticationOptions({
          ...authenticationSettings,
          database: database.drizzleDatabase,
          secret: Redacted.value(authenticationSettings.secret),
          sendVerificationOtpCode: ({ email: emailAddress, otpCode }) =>
            Effect.runPromiseWith(context)(
              email.send({
                subject: "Your sign-in verification code",
                text: otpCode,
                to: emailAddress,
              }),
            ),
        }),
      );

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

  static readonly layer = this.layerNoDeps.pipe(
    Layer.provide([Database.layer, Email.layer]),
  );
}
