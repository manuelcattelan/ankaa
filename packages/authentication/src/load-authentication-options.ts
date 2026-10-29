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

import type { SocialProviderId } from "#/make-social-provider-client.ts";

import { createAuthenticationOptions } from "#/create-authentication-options.ts";
import { makeSocialProviderClient } from "#/make-social-provider-client.ts";

const BETTER_AUTH_SECRET_MINIMUM_LENGTH = 32;

export const loadAuthenticationOptions = Effect.fn("loadAuthenticationOptions")(
  function* () {
    const email = yield* Email;

    const authenticationConfiguration = yield* Config.all({
      appleBundleId: Config.NonEmptyString("APPLE_APP_BUNDLE_IDENTIFIER"),
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
      appleKeyIdentifier: Config.NonEmptyString("APPLE_KEY_IDENTIFIER"),
      applePrivateKey: Config.schema(
        Schema.Redacted(Schema.NonEmptyString),
        "APPLE_PRIVATE_KEY",
      ),
      appleTeamIdentifier: Config.NonEmptyString("APPLE_TEAM_IDENTIFIER"),
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
      appleBundleId: authenticationConfiguration.appleBundleId,
      appleKeyIdentifier: socialProviderConfiguration.appleKeyIdentifier,
      applePrivateKey: yield* Effect.try(() =>
        createPrivateKey(
          Redacted.value(socialProviderConfiguration.applePrivateKey),
        ),
      ),
      appleTeamIdentifier: socialProviderConfiguration.appleTeamIdentifier,
      googleClientSecret: socialProviderConfiguration.googleClientSecret,
      googleWebClientId: authenticationConfiguration.googleWebClientId,
    });

    const run = yield* FiberSet.makeRuntimePromise();

    async function sendEmail(sentEmail: {
      subject: string;
      text: string;
      to: string;
    }) {
      try {
        await run(
          email
            .request(({ from, resend }) =>
              resend.emails.send({ ...sentEmail, from }),
            )
            .pipe(
              Effect.catchCause((cause) =>
                Effect.logError("Failed to send an email", cause),
              ),
            ),
        );
      } catch {
        // The send logs its own failure, so the runner's promise rejects only
        // when the Layer closes and interrupts a send still in flight
        // (https://github.com/Effect-TS/effect/blob/7f524e25cfb49a71ac39b0f44278d08d40dda5de/packages/effect/src/FiberSet.ts),
        // which leaves nothing to report.
      }
    }

    // A sign-in never fails because of Apple or Google, so a failed exchange
    // only leaves the Account without a refresh token to revoke.
    async function requestRefreshToken(options: {
      authorizationCode: string;
      providerId: SocialProviderId;
    }) {
      try {
        return await run(
          socialProviderClient
            .requestRefreshToken(options)
            .pipe(
              Effect.catchCause((cause) =>
                Effect.as(
                  Effect.logError(
                    "Failed to exchange an authorization code for a refresh token",
                    cause,
                  ),
                  null,
                ),
              ),
            ),
        );
      } catch {
        // The exchange logs its own failure, so the runner's promise rejects
        // only when the Layer closes and interrupts an exchange in flight.
        return null;
      }
    }

    async function revokeRefreshToken(options: {
      providerId: SocialProviderId;
      refreshToken: string;
    }) {
      try {
        await run(
          socialProviderClient
            .revokeRefreshToken(options)
            .pipe(
              Effect.catchCause((cause) =>
                Effect.logError("Failed to revoke a refresh token", cause),
              ),
            ),
        );
      } catch {
        // The revocation logs its own failure, so the runner's promise
        // rejects only when the Layer closes and interrupts a revocation in
        // flight.
      }
    }

    // better-auth awaits each email callback, and awaiting the email would
    // only add the provider's latency to the response
    // (https://www.better-auth.com/docs/plugins/email-otp).
    return createAuthenticationOptions({
      ...authenticationConfiguration,
      database: db,
      requestRefreshToken,
      revokeRefreshToken,
      secret: Redacted.value(authenticationConfiguration.secret),
      sendAccountDeletionLink: ({ email: emailAddress, url }) => {
        // The link stays plain text, which Resend never rewrites for click
        // tracking (https://resend.com/docs/dashboard/domains/tracking),
        // because only a link to the API host itself opens the app through
        // Universal Links and App Links.
        void sendEmail({
          subject: "Confirm deleting your Ankaa account",
          text: `Open this link to delete your Ankaa account and everything in it: ${url}\n\nIf you didn't ask to delete your account, ignore this email.`,
          to: emailAddress,
        });

        return Promise.resolve();
      },
      sendVerificationOtpCode: ({ email: emailAddress, otpCode }) => {
        void sendEmail({
          subject: "Your sign-in verification code",
          text: otpCode,
          to: emailAddress,
        });

        return Promise.resolve();
      },
    });
  },
);

function closePool(pool: Pool) {
  return Effect.promise(() => pool.end());
}
