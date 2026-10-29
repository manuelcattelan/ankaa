import { NODE_ENVIRONMENTS } from "@ankaa/core/shared/constants/node-environments";
import { urlSchema } from "@ankaa/core/shared/schemas/url-schema";
import { relations } from "@ankaa/database/relations";
import { Email } from "@ankaa/email/email";
import { drizzle } from "drizzle-orm/node-postgres";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import { Pool } from "pg";

import { createAuthenticationOptions } from "#/create-authentication-options.ts";

const BETTER_AUTH_SECRET_MINIMUM_LENGTH = 32;

export const loadAuthenticationOptions = Effect.fn("loadAuthenticationOptions")(
  function* () {
    const email = yield* Email;

    const authenticationConfiguration = yield* Config.all({
      appleAppBundleIdentifier: Config.NonEmptyString(
        "APPLE_APP_BUNDLE_IDENTIFIER",
      ),
      baseUrl: Config.schema(urlSchema, "BETTER_AUTH_URL"),
      googleIosClientId: Config.NonEmptyString("GOOGLE_IOS_CLIENT_ID"),
      googleWebClientId: Config.NonEmptyString("GOOGLE_WEB_CLIENT_ID"),
      nodeEnvironment: Config.Literals(NODE_ENVIRONMENTS, "NODE_ENV"),
      secret: Config.schema(
        Schema.Redacted(
          Schema.String.check(
            Schema.isMinLength(BETTER_AUTH_SECRET_MINIMUM_LENGTH),
          ),
        ),
        "BETTER_AUTH_SECRET",
      ),
    });

    const databaseUrl = yield* Config.Redacted("DATABASE_URL_POOLED");

    const pool = yield* Effect.acquireRelease(
      Effect.sync(
        () => new Pool({ connectionString: Redacted.value(databaseUrl) }),
      ),
      closePool,
    );

    const db = drizzle({ client: pool, relations });

    const context = yield* Effect.context();

    return createAuthenticationOptions({
      ...authenticationConfiguration,
      database: db,
      secret: Redacted.value(authenticationConfiguration.secret),
      sendVerificationOtpCode: ({ email: emailAddress, otpCode }) =>
        Effect.runPromiseWith(context)(
          email.send({
            subject: "Your sign-in verification code",
            text: otpCode,
            to: emailAddress,
          }),
        ),
    });
  },
);

function closePool(pool: Pool) {
  return Effect.promise(() => pool.end());
}
