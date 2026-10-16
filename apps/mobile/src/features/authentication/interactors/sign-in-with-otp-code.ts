import * as Effect from "effect/Effect";

import { AuthenticationClient } from "@/shared/services/authentication-client";

type SignInWithOtpCodeOptions = {
  email: string;
  otp: string;
};

export const signInWithOtpCode = Effect.fn("signInWithOtpCode")(function* (
  signInWithOtpCodeOptions: SignInWithOtpCodeOptions,
) {
  const authenticationClient = yield* AuthenticationClient;

  return yield* authenticationClient.request(
    (betterAuthenticationClient, fetchOptions) =>
      betterAuthenticationClient.signIn.emailOtp(
        signInWithOtpCodeOptions,
        fetchOptions,
      ),
  );
});
