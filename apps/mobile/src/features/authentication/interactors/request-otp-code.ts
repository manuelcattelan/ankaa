import * as Effect from "effect/Effect";

import { AuthenticationClient } from "@/shared/services/authentication-client";

type RequestOtpCodeOptions = {
  email: string;
};

export const requestOtpCode = Effect.fn("requestOtpCode")(function* (
  requestOtpCodeOptions: RequestOtpCodeOptions,
) {
  const authenticationClient = yield* AuthenticationClient;

  return yield* authenticationClient.request(
    (betterAuthenticationClient, fetchOptions) =>
      betterAuthenticationClient.emailOtp.sendVerificationOtp(
        { email: requestOtpCodeOptions.email, type: "sign-in" },
        fetchOptions,
      ),
  );
});
