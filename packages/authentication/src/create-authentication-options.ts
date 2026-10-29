import type { NodeEnvironment } from "@ankaa/core/shared/constants/node-environments";
import type { DB } from "@better-auth/drizzle-adapter/relations-v2";
import type { BetterAuthOptions } from "better-auth";

import * as AuthenticationDatabaseSchema from "@ankaa/database/schema/authentication";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { expo } from "@better-auth/expo";
import { emailOTP } from "better-auth/plugins";

type CreateAuthenticationOptionsOptions = {
  appleAppBundleIdentifier: string;
  baseUrl: string;
  database: DB;
  googleIosClientId: string;
  googleWebClientId: string;
  nodeEnvironment: NodeEnvironment;
  secret: string;
  sendVerificationOtpCode: (
    options: SendVerificationOtpCodeOptions,
  ) => Promise<void>;
};

type SendVerificationOtpCodeOptions = {
  email: string;
  otpCode: string;
};

const DEVELOPMENT_TRUSTED_ORIGINS = [
  "exp://",
  "exp://**",
  "exp://192.168.*.*:*/**",
];

export function createAuthenticationOptions({
  appleAppBundleIdentifier,
  baseUrl,
  database,
  googleIosClientId,
  googleWebClientId,
  nodeEnvironment,
  secret,
  sendVerificationOtpCode,
}: CreateAuthenticationOptionsOptions) {
  return {
    advanced: { database: { generateId: "uuid" } },
    baseURL: baseUrl,
    database: drizzleAdapter(database, {
      provider: "pg",
      schema: AuthenticationDatabaseSchema,
      schemaName: "authentication",
    }),
    plugins: [
      expo(),
      emailOTP({
        sendVerificationOTP: ({ email, otp }) =>
          sendVerificationOtpCode({ email, otpCode: otp }),
      }),
    ],
    secret,
    session: { cookieCache: { enabled: true } },
    socialProviders: {
      apple: { clientId: appleAppBundleIdentifier },
      google: { clientId: [googleWebClientId, googleIosClientId] },
    },
    trustedOrigins: [
      "ankaa://",
      ...(nodeEnvironment === "development" ? DEVELOPMENT_TRUSTED_ORIGINS : []),
    ],
  } satisfies BetterAuthOptions;
}
