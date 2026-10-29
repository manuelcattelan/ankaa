import type { NodeEnvironment } from "@ankaa/core/shared/constants/node-environments";
import type { DB } from "@better-auth/drizzle-adapter/relations-v2";
import type { BetterAuthOptions } from "better-auth";

import { OTP_CODE_LENGTH } from "@ankaa/core/features/authentication/constants/otp-code-length";
import * as AuthenticationDatabaseSchema from "@ankaa/database/schema/authentication";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { expo } from "@better-auth/expo";
import { emailOTP } from "better-auth/plugins";

const DEVELOPMENT_TRUSTED_ORIGINS = [
  "exp://",
  "exp://**",
  "exp://192.168.*.*:*/**",
];

export function createAuthenticationOptions({
  appleBundleId,
  baseUrl,
  database,
  googleIosClientId,
  googleWebClientId,
  nodeEnvironment,
  secret,
  sendVerificationOtpCode,
}: {
  appleBundleId: string;
  baseUrl: string;
  database: DB;
  googleIosClientId: string;
  googleWebClientId: string;
  nodeEnvironment: NodeEnvironment;
  secret: string;
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
      apple: { clientId: appleBundleId },
      google: { clientId: [googleWebClientId, googleIosClientId] },
    },
    trustedOrigins: [
      "ankaa://",
      ...(nodeEnvironment === "development" ? DEVELOPMENT_TRUSTED_ORIGINS : []),
    ],
  } satisfies BetterAuthOptions;
}
