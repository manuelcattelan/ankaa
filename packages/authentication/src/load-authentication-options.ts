import { NODE_ENVIRONMENTS } from "@ankaa/core/shared/constants/node-environment";
import { urlSchema } from "@ankaa/core/shared/schemas/url-schema";
import { Database } from "@ankaa/database";
import { Email } from "@ankaa/email";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";

import { createAuthenticationOptions } from "./create-authentication-options.ts";

const BETTER_AUTH_SECRET_MINIMUM_LENGTH = 32;

export const loadAuthenticationOptions = Effect.fn("loadAuthenticationOptions")(
  function* () {
    const database = yield* Database;
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

    const context = yield* Effect.context();

    return createAuthenticationOptions({
      ...authenticationConfiguration,
      database: database.drizzleDatabase,
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
