import { db } from "@ankaa/db";
import * as schema from "@ankaa/db/schema";
import { sendEmail } from "@ankaa/email";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";

import { env } from "./env.ts";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, { provider: "pg", schema, schemaName: "auth" }),
  plugins: [
    expo(),
    emailOTP({
      sendVerificationOTP: ({ email, otp }) =>
        sendEmail({ subject: "Your sign-in code", text: otp, to: email }),
    }),
  ],
  secret: env.BETTER_AUTH_SECRET,
  session: {
    cookieCache: {
      enabled: true,
    },
  },
  socialProviders: {
    apple: { clientId: env.APPLE_APP_BUNDLE_IDENTIFIER },
    google: { clientId: [env.GOOGLE_WEB_CLIENT_ID, env.GOOGLE_IOS_CLIENT_ID] },
  },
  trustedOrigins: [
    "ankaa://",
    ...(env.NODE_ENV === "development"
      ? ["exp://", "exp://**", "exp://192.168.*.*:*/**"]
      : []),
  ],
});
