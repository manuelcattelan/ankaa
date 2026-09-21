import { db } from "@ankaa/db";
import * as schema from "@ankaa/db/schema";
import { sendEmail } from "@ankaa/email";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";

import { env } from "./env.ts";

// Better Auth awaits these callbacks. The send itself is deliberately not
// awaited, per the Better Auth docs, to prevent timing attacks.
function sendEmailInBackground(
  email: Parameters<typeof sendEmail>[0],
): Promise<void> {
  void sendEmail(email).catch((cause: unknown) => {
    console.error("Unexpected error while sending email:", cause);
  });
  return Promise.resolve();
}

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, { provider: "pg", schema, schemaName: "auth" }),
  disabledPaths: ["/sign-in/email-otp"],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: ({ url, user }) =>
      sendEmailInBackground({
        subject: "Reset your password",
        text: url,
        to: user.email,
      }),
  },
  emailVerification: {
    sendVerificationEmail: ({ url, user }) =>
      sendEmailInBackground({
        subject: "Verify your email",
        text: url,
        to: user.email,
      }),
  },
  plugins: [
    expo(),
    emailOTP({
      disableSignUp: true,
      sendVerificationOTP: ({ email, otp, type }) => {
        // The sign-in endpoint is disabled via `disabledPaths`, so a sign-in
        // code must never be mailed.
        if (type === "sign-in") {
          return Promise.resolve();
        }
        return sendEmailInBackground({
          subject:
            type === "forget-password"
              ? "Reset your password"
              : "Verify your email",
          text: otp,
          to: email,
        });
      },
      storeOTP: "hashed",
    }),
  ],
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    "ankaa://",
    ...(env.NODE_ENV === "development"
      ? ["exp://", "exp://**", "exp://192.168.*.*:*/**"]
      : []),
  ],
});
