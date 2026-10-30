import { NODE_ENVIRONMENTS } from "@ankaa/core/shared/constants/node-environments";
import { urlSchema } from "@ankaa/core/shared/schemas/url-schema";
import { relations } from "@ankaa/database/relations";
import { Email } from "@ankaa/email/email";
import { drizzle } from "drizzle-orm/node-postgres";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as FiberSet from "effect/FiberSet";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import { createPrivateKey } from "node:crypto";
import { Pool } from "pg";

import { createAuthenticationOptions } from "#/create-authentication-options.ts";
import { makeSocialProviderClient } from "#/make-social-provider-client.ts";

const BETTER_AUTH_SECRET_MINIMUM_LENGTH = 32;

export const loadAuthenticationOptions = Effect.fn("loadAuthenticationOptions")(
  function* () {
    const email = yield* Email;

    const authenticationConfiguration = yield* Config.all({
      appleAppBundleId: Config.NonEmptyString("APPLE_APP_BUNDLE_ID"),
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

    const socialProviderConfiguration = yield* Config.all({
      appleKeyId: Config.NonEmptyString("APPLE_KEY_ID"),
      applePrivateKey: Config.schema(
        Schema.Redacted(Schema.NonEmptyString),
        "APPLE_PRIVATE_KEY",
      ),
      appleTeamId: Config.NonEmptyString("APPLE_TEAM_ID"),
      googleClientSecret: Config.schema(
        Schema.Redacted(Schema.NonEmptyString),
        "GOOGLE_CLIENT_SECRET",
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

    const socialProviderClient = yield* makeSocialProviderClient({
      appleAppBundleId: authenticationConfiguration.appleAppBundleId,
      appleKeyId: socialProviderConfiguration.appleKeyId,
      applePrivateKey: yield* Effect.try(() =>
        createPrivateKey(
          Redacted.value(socialProviderConfiguration.applePrivateKey),
        ),
      ),
      appleTeamId: socialProviderConfiguration.appleTeamId,
      googleClientSecret: socialProviderConfiguration.googleClientSecret,
      googleWebClientId: authenticationConfiguration.googleWebClientId,
    });

    const run = yield* FiberSet.makeRuntimePromise();

    /**
     * Runs `effect` in the Layer's runner and logs its failure with
     * `message`, settling with `null` instead, because neither a sign-in nor
     * an Account deletion may fail because of an email, Apple or Google
     * (https://github.com/manuelcattelan/ankaa/issues/86).
     */
    async function runLoggingFailure<TSuccess>({
      effect,
      message,
    }: {
      effect: Effect.Effect<TSuccess, unknown>;
      message: string;
    }) {
      try {
        return await run(
          effect.pipe(
            Effect.catchCause((cause) =>
              Effect.as(Effect.logError(message, cause), null),
            ),
          ),
        );
      } catch {
        // The effect logs its own failure, so the runner's promise rejects
        // only when the Layer closes and interrupts an effect still in flight
        // (https://github.com/Effect-TS/effect/blob/7f524e25cfb49a71ac39b0f44278d08d40dda5de/packages/effect/src/FiberSet.ts),
        // which leaves nothing to report.
        return null;
      }
    }

    // better-auth awaits each email callback, and awaiting the email would
    // only add the provider's latency to the response
    // (https://www.better-auth.com/docs/plugins/email-otp).
    function sendEmailWithoutWaiting(sentEmail: {
      subject: string;
      text: string;
      to: string;
    }) {
      void runLoggingFailure({
        effect: email.request(({ from, resend }) =>
          resend.emails.send({ ...sentEmail, from }),
        ),
        message: "Failed to send an email",
      });

      return Promise.resolve();
    }

    return createAuthenticationOptions({
      ...authenticationConfiguration,
      database: db,
      requestRefreshToken: (refreshTokenRequest) =>
        runLoggingFailure({
          effect: socialProviderClient.requestRefreshToken(refreshTokenRequest),
          message:
            "Failed to exchange an authorization code for a refresh token",
        }),
      revokeRefreshToken: async (refreshTokenRevocation) => {
        await runLoggingFailure({
          effect: socialProviderClient.revokeRefreshToken(
            refreshTokenRevocation,
          ),
          message: "Failed to revoke a refresh token",
        });
      },
      secret: Redacted.value(authenticationConfiguration.secret),
      sendAccountDeletionLink: ({ email: emailAddress, url }) =>
        // The link stays plain text, which Resend never rewrites for click
        // tracking (https://resend.com/docs/dashboard/domains/tracking),
        // because only a link to the API host itself opens the app through
        // Universal Links and App Links.
        sendEmailWithoutWaiting({
          subject: "Confirm deleting your Ankaa account",
          text: url,
          to: emailAddress,
        }),
      sendVerificationOtpCode: ({ email: emailAddress, otpCode }) =>
        sendEmailWithoutWaiting({
          subject: "Your sign-in verification code",
          text: otpCode,
          to: emailAddress,
        }),
    });
  },
);

function closePool(pool: Pool) {
  return Effect.promise(() => pool.end());
}
