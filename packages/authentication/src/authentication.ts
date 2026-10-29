import { Email } from "@ankaa/email/email";
import { betterAuth } from "better-auth";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { loadAuthenticationOptions } from "#/load-authentication-options.ts";
import { makeAuthentication } from "#/make-authentication.ts";

export class Authentication extends Context.Service<Authentication>()(
  "@ankaa/authentication/Authentication",
  {
    make: Effect.gen(function* () {
      const authenticationOptions = yield* loadAuthenticationOptions();

      return yield* makeAuthentication(betterAuth(authenticationOptions));
    }),
  },
) {
  static readonly layerNoDeps = Layer.effect(this, this.make);

  static readonly layer = this.layerNoDeps.pipe(Layer.provide(Email.layer));
}
