import type { NodeEnvironment } from "@ankaa/core/shared/constants/node-environments";
import type { DB } from "@better-auth/drizzle-adapter/relations-v2";
import type { BetterAuthOptions } from "better-auth";

import { AUTHORIZATION_CODE_HEADER_NAME } from "@ankaa/core/features/authentication/constants/authorization-code-header-name";
import { OTP_CODE_LENGTH } from "@ankaa/core/features/authentication/constants/otp-code-length";
import * as AuthenticationDatabaseSchema from "@ankaa/database/schema/authentication";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { expo } from "@better-auth/expo";
import { createAuthMiddleware } from "better-auth/api";
import { emailOTP } from "better-auth/plugins";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";

import type { SocialProviderId } from "#/make-social-provider-client.ts";

import { socialProviderIdSchema } from "#/make-social-provider-client.ts";

const ACCOUNT_DELETION_PATH = "/delete-account";

const DEVELOPMENT_TRUSTED_ORIGINS = [
  "exp://",
  "exp://**",
  "exp://192.168.*.*:*/**",
];

const signInSocialBodySchema = Schema.Struct({
  provider: socialProviderIdSchema,
});

export function createAuthenticationOptions({
  appleAppBundleId,
  baseUrl,
  database,
  googleIosClientId,
  googleWebClientId,
  nodeEnvironment,
  requestRefreshToken,
  revokeRefreshToken,
  secret,
  sendAccountDeletionLink,
  sendVerificationOtpCode,
}: {
  appleAppBundleId: string;
  baseUrl: string;
  database: DB;
  googleIosClientId: string;
  googleWebClientId: string;
  nodeEnvironment: NodeEnvironment;
  requestRefreshToken: (options: {
    authorizationCode: string;
    providerId: SocialProviderId;
  }) => Promise<null | string>;
  revokeRefreshToken: (options: {
    providerId: SocialProviderId;
    refreshToken: string;
  }) => Promise<void>;
  secret: string;
  sendAccountDeletionLink: (options: {
    email: string;
    url: string;
  }) => Promise<void>;
  sendVerificationOtpCode: (options: {
    email: string;
    otpCode: string;
  }) => Promise<void>;
}) {
  return {
    advanced: { database: { generateId: "uuid" } },
    baseURL: baseUrl,
    database: drizzleAdapter(database, {
      provider: "pg",
      schema: AuthenticationDatabaseSchema,
      schemaName: "authentication",
    }),
    databaseHooks: {
      account: {
        delete: {
          // better-auth runs this hook once the Account's rows are deleted,
          // and a throw here would still fail the deletion's response
          // (https://github.com/better-auth/better-auth/blob/v1.7.5/packages/better-auth/src/db/with-hooks.ts),
          // so `revokeRefreshToken` catches its own errors: a failure at Apple
          // or Google must never block the deletion.
          after: async ({ providerId, refreshToken }) => {
            if (
              refreshToken === null ||
              refreshToken === undefined ||
              !Schema.is(socialProviderIdSchema)(providerId)
            ) {
              return;
            }

            await revokeRefreshToken({ providerId, refreshToken });
          },
        },
      },
    },
    hooks: {
      // better-auth stores no refresh token for a sign-in with an id token
      // (https://github.com/better-auth/better-auth/blob/v1.7.5/packages/better-auth/src/api/routes/sign-in.ts),
      // so the server exchanges the sign-in's authorization code for one, to
      // revoke it when the Account is deleted.
      after: createAuthMiddleware(async (ctx) => {
        const authorizationCode =
          ctx.headers?.get(AUTHORIZATION_CODE_HEADER_NAME) ?? null;
        const newSession = ctx.context.newSession;
        const body = Schema.decodeUnknownOption(signInSocialBodySchema)(
          ctx.body,
        );

        if (
          ctx.path !== "/sign-in/social" ||
          newSession === null ||
          authorizationCode === null ||
          Option.isNone(body)
        ) {
          return;
        }

        const providerId = body.value.provider;

        const refreshToken = await requestRefreshToken({
          authorizationCode,
          providerId,
        });

        if (refreshToken === null) {
          return;
        }

        const accounts = await ctx.context.internalAdapter.findAccounts(
          newSession.user.id,
        );
        const account = accounts.find(
          (userAccount) => userAccount.providerId === providerId,
        );

        if (account !== undefined) {
          await ctx.context.internalAdapter.updateAccount(account.id, {
            refreshToken,
          });
        }
      }),
    },
    plugins: [
      expo(),
      emailOTP({
        otpLength: OTP_CODE_LENGTH,
        sendVerificationOTP: ({ email, otp }) =>
          sendVerificationOtpCode({ email, otpCode: otp }),
        storeOTP: "hashed",
      }),
    ],
    // better-auth turns its default rate limits on only in production unless
    // told otherwise, and they must hold in every environment
    // (https://github.com/better-auth/better-auth/blob/v1.7.5/packages/better-auth/src/context/create-context.ts).
    rateLimit: { enabled: true },
    secret,
    socialProviders: {
      apple: { clientId: appleAppBundleId },
      google: { clientId: [googleWebClientId, googleIosClientId] },
    },
    trustedOrigins: [
      "ankaa://",
      ...(nodeEnvironment === "development" ? DEVELOPMENT_TRUSTED_ORIGINS : []),
    ],
    user: {
      deleteUser: {
        enabled: true,
        // The email links to the app's own /delete-account route on the API
        // host instead of better-auth's `url`, because the Expo plugin
        // rewrites only its own callback paths for the app, never
        // /delete-user/callback
        // (https://github.com/better-auth/better-auth/blob/v1.7.5/packages/expo/src/index.ts).
        sendDeleteAccountVerification: ({ token, user }) =>
          sendAccountDeletionLink({
            email: user.email,
            url: buildAccountDeletionUrl({ baseUrl, token }),
          }),
      },
    },
  } satisfies BetterAuthOptions;
}

function buildAccountDeletionUrl({
  baseUrl,
  token,
}: {
  baseUrl: string;
  token: string;
}) {
  const accountDeletionUrl = new URL(ACCOUNT_DELETION_PATH, baseUrl);

  accountDeletionUrl.searchParams.set("token", token);

  return accountDeletionUrl.toString();
}
