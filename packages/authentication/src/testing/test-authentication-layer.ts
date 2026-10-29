import { betterAuth } from "better-auth";
import { testUtils } from "better-auth/plugins";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { Authentication } from "#/authentication.ts";
import { loadAuthenticationOptions } from "#/load-authentication-options.ts";
import { makeAuthentication } from "#/make-authentication.ts";
import { AuthenticationTestHelpers } from "#/testing/authentication-test-helpers.ts";

export const testAuthenticationLayer = Layer.effectContext(
  Effect.gen(function* () {
    const authenticationOptions = yield* loadAuthenticationOptions();

    const betterAuthentication = betterAuth({
      ...authenticationOptions,
      plugins: [...authenticationOptions.plugins, testUtils()],
    });

    const authentication = yield* makeAuthentication(betterAuthentication);

    const betterAuthenticationContext = yield* Effect.promise(
      () => betterAuthentication.$context,
    );

    return Context.make(Authentication, authentication).pipe(
      Context.add(AuthenticationTestHelpers, betterAuthenticationContext.test),
    );
  }),
);
