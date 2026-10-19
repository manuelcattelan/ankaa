import { Database } from "@ankaa/database";
import { betterAuth } from "better-auth";
import { testUtils } from "better-auth/plugins";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";

import { authenticationConfiguration } from "../authentication-configuration.ts";
import { createAuthenticationOptions } from "../create-authentication-options.ts";

export type TestAuthentication = Effect.Success<
  ReturnType<typeof createTestAuthentication>
>;

export const createTestAuthentication = Effect.fn("createTestAuthentication")(
  function* () {
    const database = yield* Database;
    const authenticationSettings = yield* authenticationConfiguration;

    const authenticationOptions = createAuthenticationOptions({
      ...authenticationSettings,
      database: database.drizzleDatabase,
      secret: Redacted.value(authenticationSettings.secret),
      sendVerificationOtpCode: () => Promise.resolve(),
    });

    return betterAuth({
      ...authenticationOptions,
      plugins: [...authenticationOptions.plugins, testUtils()],
    });
  },
);
