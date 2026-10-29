import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import type { AuthenticationClientError } from "#/shared/errors/authentication-client-error.ts";
import type { EmailInvalidError } from "#/shared/errors/email-invalid-error.ts";
import type { OtpCodeAttemptsExceededError } from "#/shared/errors/otp-code-attempts-exceeded-error.ts";
import type { OtpCodeExpiredError } from "#/shared/errors/otp-code-expired-error.ts";
import type { OtpCodeInvalidError } from "#/shared/errors/otp-code-invalid-error.ts";
import type { RateLimitedError } from "#/shared/errors/rate-limited-error.ts";

import { AuthenticationClient } from "#/shared/services/authentication-client.ts";

export class AuthenticationApplicationService extends Context.Service<
  AuthenticationApplicationService,
  {
    readonly requestOtpCode: (options: {
      email: string;
    }) => Effect.Effect<
      void,
      AuthenticationClientError | EmailInvalidError | RateLimitedError
    >;
    readonly signInWithOtpCode: (options: {
      email: string;
      otpCode: string;
    }) => Effect.Effect<
      void,
      | AuthenticationClientError
      | OtpCodeAttemptsExceededError
      | OtpCodeExpiredError
      | OtpCodeInvalidError
      | RateLimitedError
    >;
  }
>()("@ankaa/mobile/features/authentication/AuthenticationApplicationService") {
  static readonly layerNoDeps = Layer.effect(
    AuthenticationApplicationService,
    Effect.gen(function* () {
      const authenticationClient = yield* AuthenticationClient;

      const requestOtpCode = Effect.fn(
        "AuthenticationApplicationService.requestOtpCode",
      )(
        function* ({ email }: { email: string }) {
          yield* authenticationClient.request(({ authClient, fetchOptions }) =>
            authClient.emailOtp.sendVerificationOtp(
              { email, type: "sign-in" },
              fetchOptions,
            ),
          );
        },
        Effect.catchTag(
          [
            "AccountNotLinkedError",
            "EmailNotSharedError",
            "OtpCodeAttemptsExceededError",
            "OtpCodeExpiredError",
            "OtpCodeInvalidError",
          ],
          Effect.die,
        ),
      );

      const signInWithOtpCode = Effect.fn(
        "AuthenticationApplicationService.signInWithOtpCode",
      )(
        function* ({ email, otpCode }: { email: string; otpCode: string }) {
          yield* authenticationClient.request(({ authClient, fetchOptions }) =>
            authClient.signIn.emailOtp({ email, otp: otpCode }, fetchOptions),
          );
        },
        Effect.catchTag(
          ["AccountNotLinkedError", "EmailInvalidError", "EmailNotSharedError"],
          Effect.die,
        ),
      );

      return AuthenticationApplicationService.of({
        requestOtpCode,
        signInWithOtpCode,
      });
    }),
  );

  static readonly layer = AuthenticationApplicationService.layerNoDeps.pipe(
    Layer.provide(AuthenticationClient.layer),
  );
}
