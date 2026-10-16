import type { DB } from "@better-auth/drizzle-adapter/relations-v2";
import type { BetterAuthOptions } from "better-auth";

import * as DatabaseSchema from "@ankaa/database/schema";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { expo } from "@better-auth/expo";
import { emailOTP } from "better-auth/plugins";

type CreateAuthenticationOptionsOptions = {
  appleAppBundleIdentifier: string;
  baseUrl: string;
  database: DB;
  googleIosClientId: string;
  googleWebClientId: string;
  nodeEnvironment: "development" | "production";
  secret: string;
  sendVerificationOtp: (options: SendVerificationOtpOptions) => Promise<void>;
};

type SendVerificationOtpOptions = {
  email: string;
  otp: string;
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
  sendVerificationOtp,
}: CreateAuthenticationOptionsOptions) {
  return {
    baseURL: baseUrl,
    database: drizzleAdapter(database, {
      provider: "pg",
      schema: DatabaseSchema,
      schemaName: "auth",
    }),
    plugins: [
      expo(),
      emailOTP({
        sendVerificationOTP: ({ email, otp }) =>
          sendVerificationOtp({ email, otp }),
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
