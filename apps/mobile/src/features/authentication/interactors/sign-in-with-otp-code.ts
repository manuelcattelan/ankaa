import * as Effect from "effect/Effect";

import { AuthenticationClient } from "#/shared/services/authentication-client.ts";

export type SignInWithOtpCodeOptions = {
  email: string;
  otpCode: string;
};

export const signInWithOtpCode = Effect.fn("signInWithOtpCode")(function* (
  signInWithOtpCodeOptions: SignInWithOtpCodeOptions,
) {
  const authenticationClient = yield* AuthenticationClient;

  return yield* authenticationClient.request(
    (betterAuthenticationClient, fetchOptions) =>
      betterAuthenticationClient.signIn.emailOtp(
        {
          email: signInWithOtpCodeOptions.email,
          otp: signInWithOtpCodeOptions.otpCode,
        },
        fetchOptions,
      ),
  );
});
