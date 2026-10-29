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

    const auth = betterAuth({
      ...authenticationOptions,
      plugins: [...authenticationOptions.plugins, createTestUtilsPlugin()],
    });

    const authentication = yield* makeAuthentication(auth);

    const ctx = yield* Effect.promise(() => auth.$context);

    return Context.make(Authentication, Authentication.of(authentication)).pipe(
      Context.add(
        AuthenticationTestHelpers,
        AuthenticationTestHelpers.of(ctx.test),
      ),
    );
  }),
);

// testUtils' init returns `options: undefined` when it captures no OTP
// (https://github.com/better-auth/better-auth/blob/v1.7.5/packages/better-auth/src/plugins/test-utils/index.ts#L157),
// which better-auth's own plugin type rejects under exactOptionalPropertyTypes,
// so leave the key out instead.
function createTestUtilsPlugin() {
  const testUtilsPlugin = testUtils();

  return {
    ...testUtilsPlugin,
    init: (ctx: Parameters<typeof testUtilsPlugin.init>[0]) => {
      const testUtilsInitResult = testUtilsPlugin.init(ctx);

      return testUtilsInitResult.options === undefined
        ? { context: testUtilsInitResult.context }
        : {
            context: testUtilsInitResult.context,
            options: testUtilsInitResult.options,
          };
    },
  };
}
