import { database } from "@ankaa/database";
import * as DatabaseSchema from "@ankaa/database/schema";
import { sendEmail } from "@ankaa/email";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";

import { environment } from "./environment.ts";

const DEVELOPMENT_TRUSTED_ORIGINS = [
  "exp://",
  "exp://**",
  "exp://192.168.*.*:*/**",
];

export const auth = betterAuth({
  baseURL: environment.BETTER_AUTH_URL,
  database: drizzleAdapter(database, {
    provider: "pg",
    schema: DatabaseSchema,
    schemaName: "auth",
  }),
  plugins: [
    expo(),
    emailOTP({
      sendVerificationOTP: ({ email, otp }) =>
        sendEmail({ subject: "Your sign-in OTP code", text: otp, to: email }),
    }),
  ],
  secret: environment.BETTER_AUTH_SECRET,
  session: { cookieCache: { enabled: true } },
  socialProviders: {
    apple: { clientId: environment.APPLE_APP_BUNDLE_IDENTIFIER },
    google: {
      clientId: [
        environment.GOOGLE_WEB_CLIENT_ID,
        environment.GOOGLE_IOS_CLIENT_ID,
      ],
    },
  },
  trustedOrigins: [
    "ankaa://",
    ...(environment.NODE_ENV === "development"
      ? DEVELOPMENT_TRUSTED_ORIGINS
      : []),
  ],
});
