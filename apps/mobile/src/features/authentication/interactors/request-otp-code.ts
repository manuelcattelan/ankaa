import * as Effect from "effect/Effect";

import { AuthenticationClient } from "#/shared/services/authentication-client.ts";

export type RequestOtpCodeOptions = {
  email: string;
};

export const requestOtpCode = Effect.fn("requestOtpCode")(function* (
  requestOtpCodeOptions: RequestOtpCodeOptions,
) {
  const authenticationClient = yield* AuthenticationClient;

  return yield* authenticationClient.request(({ authClient, fetchOptions }) =>
    authClient.emailOtp.sendVerificationOtp(
      { email: requestOtpCodeOptions.email, type: "sign-in" },
      fetchOptions,
    ),
  );
});
