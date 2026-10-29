import type * as ExpoAppleAuthentication from "expo-apple-authentication";

import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import type { GooglePlayServicesMissingError } from "#/features/authentication/errors/google-play-services-missing-error.ts";
import type { AccountNotLinkedError } from "#/shared/errors/account-not-linked-error.ts";
import type { AuthenticationClientError } from "#/shared/errors/authentication-client-error.ts";
import type { EmailInvalidError } from "#/shared/errors/email-invalid-error.ts";
import type { EmailNotSharedError } from "#/shared/errors/email-not-shared-error.ts";
import type { OtpCodeAttemptsExceededError } from "#/shared/errors/otp-code-attempts-exceeded-error.ts";
import type { OtpCodeExpiredError } from "#/shared/errors/otp-code-expired-error.ts";
import type { OtpCodeInvalidError } from "#/shared/errors/otp-code-invalid-error.ts";
import type { RateLimitedError } from "#/shared/errors/rate-limited-error.ts";

import { AppleSignIn } from "#/features/authentication/services/apple-sign-in.ts";
import { GoogleSignIn } from "#/features/authentication/services/google-sign-in.ts";
import { AuthenticationClient } from "#/shared/services/authentication-client.ts";
import { Crypto } from "#/shared/services/crypto.ts";

export class AuthenticationApplicationService extends Context.Service<
  AuthenticationApplicationService,
  {
    readonly requestOtpCode: (options: {
      email: string;
    }) => Effect.Effect<
      void,
      AuthenticationClientError | EmailInvalidError | RateLimitedError
    >;
    readonly signInWithApple: () => Effect.Effect<
      void,
      | AccountNotLinkedError
      | AuthenticationClientError
      | EmailNotSharedError
      | RateLimitedError
    >;
    readonly signInWithGoogle: () => Effect.Effect<
      void,
      | AccountNotLinkedError
      | AuthenticationClientError
      | EmailNotSharedError
      | GooglePlayServicesMissingError
      | RateLimitedError
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
    readonly signOut: () => Effect.Effect<void, AuthenticationClientError>;
  }
>()("@ankaa/mobile/features/authentication/AuthenticationApplicationService") {
  static readonly layerNoDeps = Layer.effect(
    AuthenticationApplicationService,
    Effect.gen(function* () {
      const appleSignIn = yield* AppleSignIn;
      const authenticationClient = yield* AuthenticationClient;
      const crypto = yield* Crypto;
      const googleSignIn = yield* GoogleSignIn;

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

      const signInWithApple = Effect.fn(
        "AuthenticationApplicationService.signInWithApple",
      )(
        function* () {
          const nonce = yield* crypto.createRandomUuid();
          const hashedNonce = yield* crypto.createSha256Digest(nonce);

          const credential = yield* appleSignIn.signIn(hashedNonce);

          if (
            credential.identityToken === null ||
            credential.identityToken === ""
          ) {
            return yield* Effect.die(
              new Error("Failed to receive an identity token from Apple"),
            );
          }

          const appleIdToken = buildAppleIdToken({
            credential,
            identityToken: credential.identityToken,
            nonce,
          });

          yield* authenticationClient.request(({ authClient, fetchOptions }) =>
            authClient.signIn.social(
              { idToken: appleIdToken, provider: "apple" },
              fetchOptions,
            ),
          );
        },
        Effect.catchTag("AppleSignInCanceledError", () => Effect.void),
        Effect.catchTag(
          [
            "EmailInvalidError",
            "OtpCodeAttemptsExceededError",
            "OtpCodeExpiredError",
            "OtpCodeInvalidError",
          ],
          Effect.die,
        ),
      );

      const signInWithGoogle = Effect.fn(
        "AuthenticationApplicationService.signInWithGoogle",
      )(
        function* () {
          yield* googleSignIn.checkPlayServices();

          const signInResponse = yield* googleSignIn.signIn();

          if (signInResponse.type !== "success") {
            return;
          }

          const idToken = signInResponse.data.idToken;

          if (idToken === null || idToken === "") {
            return yield* Effect.die(
              new Error("Failed to receive an identity token from Google"),
            );
          }

          yield* authenticationClient.request(({ authClient, fetchOptions }) =>
            authClient.signIn.social(
              { idToken: { token: idToken }, provider: "google" },
              fetchOptions,
            ),
          );
        },
        Effect.catchTag("GoogleSignInInProgressError", () => Effect.void),
        Effect.catchTag(
          [
            "EmailInvalidError",
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

      const signOut = Effect.fn("AuthenticationApplicationService.signOut")(
        function* () {
          yield* authenticationClient.request(({ authClient, fetchOptions }) =>
            authClient.signOut({ fetchOptions }),
          );

          yield* googleSignIn.signOut();
        },
        Effect.catchTag(
          [
            "AccountNotLinkedError",
            "EmailInvalidError",
            "EmailNotSharedError",
            "OtpCodeAttemptsExceededError",
            "OtpCodeExpiredError",
            "OtpCodeInvalidError",
            "RateLimitedError",
          ],
          Effect.die,
        ),
      );

      return AuthenticationApplicationService.of({
        requestOtpCode,
        signInWithApple,
        signInWithGoogle,
        signInWithOtpCode,
        signOut,
      });
    }),
  );

  static readonly layer = AuthenticationApplicationService.layerNoDeps.pipe(
    Layer.provide(
      Layer.mergeAll(
        AppleSignIn.layer,
        AuthenticationClient.layer,
        Crypto.layer,
        GoogleSignIn.layer,
      ),
    ),
  );
}

function buildAppleIdToken({
  credential,
  identityToken,
  nonce,
}: {
  credential: ExpoAppleAuthentication.AppleAuthenticationCredential;
  identityToken: string;
  nonce: string;
}) {
  const firstName = credential.fullName?.givenName ?? null;
  const lastName = credential.fullName?.familyName ?? null;
  const appleIdToken = { nonce, token: identityToken };

  if ((firstName ?? lastName ?? "") === "") {
    return appleIdToken;
  }

  return {
    ...appleIdToken,
    user: {
      name: {
        ...(firstName === null ? {} : { firstName }),
        ...(lastName === null ? {} : { lastName }),
      },
    },
  };
}
