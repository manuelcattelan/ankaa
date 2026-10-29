import { betterAuth } from "better-auth";
import { testUtils } from "better-auth/plugins";
import * as Effect from "effect/Effect";

import { loadAuthenticationOptions } from "#/load-authentication-options.ts";

export type TestAuthentication = Effect.Success<
  ReturnType<typeof createTestAuthentication>
>;

export const createTestAuthentication = Effect.fn("createTestAuthentication")(
  function* () {
    const authenticationOptions = yield* loadAuthenticationOptions();

    return betterAuth({
      ...authenticationOptions,
      plugins: [...authenticationOptions.plugins, testUtils()],
    });
  },
);
