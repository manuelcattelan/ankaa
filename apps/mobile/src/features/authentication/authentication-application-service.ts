import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import type { GooglePlayServicesMissingError } from "#/features/authentication/errors/google-play-services-missing-error.ts";
import type { AuthenticationClientError } from "#/shared/errors/authentication-client-error.ts";

import { addAuthorizationCodeHeader } from "#/features/authentication/core/add-authorization-code-header.ts";
import { buildAppleIdToken } from "#/features/authentication/core/build-apple-id-token.ts";
import { AppleSignIn } from "#/features/authentication/services/apple-sign-in.ts";
import { GoogleSignIn } from "#/features/authentication/services/google-sign-in.ts";
import { AccountNotLinkedError } from "#/shared/errors/account-not-linked-error.ts";
import { DeleteAccountTokenInvalidError } from "#/shared/errors/delete-account-token-invalid-error.ts";
import { EmailInvalidError } from "#/shared/errors/email-invalid-error.ts";
import { EmailNotSharedError } from "#/shared/errors/email-not-shared-error.ts";
import { OtpCodeAttemptsExceededError } from "#/shared/errors/otp-code-attempts-exceeded-error.ts";
import { OtpCodeExpiredError } from "#/shared/errors/otp-code-expired-error.ts";
import { OtpCodeInvalidError } from "#/shared/errors/otp-code-invalid-error.ts";
import { RateLimitedError } from "#/shared/errors/rate-limited-error.ts";
import { AuthenticationClient } from "#/shared/services/authentication-client.ts";
import { Crypto } from "#/shared/services/crypto.ts";
import { Notifications } from "#/shared/services/notifications.ts";

export class AuthenticationApplicationService extends Context.Service<
  AuthenticationApplicationService,
  {
    readonly deleteAccount: (options: {
      token: string;
    }) => Effect.Effect<
      void,
      | AuthenticationClientError
      | DeleteAccountTokenInvalidError
      | RateLimitedError
    >;
    readonly requestAccountDeletion: () => Effect.Effect<
      void,
      AuthenticationClientError | RateLimitedError
    >;
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
      const notifications = yield* Notifications;

      const requestAccountDeletion = Effect.fn(
        "AuthenticationApplicationService.requestAccountDeletion",
      )(function* () {
        yield* authenticationClient.request({
          call: ({ authClient, fetchOptions }) =>
            authClient.deleteUser({ fetchOptions }),
          errors: [RateLimitedError],
        });
      });

      const requestOtpCode = Effect.fn(
        "AuthenticationApplicationService.requestOtpCode",
      )(function* ({ email }: { email: string }) {
        yield* authenticationClient.request({
          call: ({ authClient, fetchOptions }) =>
            authClient.emailOtp.sendVerificationOtp(
              { email, type: "sign-in" },
              fetchOptions,
            ),
          errors: [EmailInvalidError, RateLimitedError],
        });
      });

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

          yield* authenticationClient.request({
            call: ({ authClient, fetchOptions }) =>
              authClient.signIn.social(
                { idToken: appleIdToken, provider: "apple" },
                addAuthorizationCodeHeader({
                  authorizationCode: credential.authorizationCode,
                  fetchOptions,
                }),
              ),
            errors: [
              AccountNotLinkedError,
              EmailNotSharedError,
              RateLimitedError,
            ],
          });
        },
        Effect.catchTag("AppleSignInCanceledError", () => Effect.void),
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

          yield* authenticationClient.request({
            call: ({ authClient, fetchOptions }) =>
              authClient.signIn.social(
                { idToken: { token: idToken }, provider: "google" },
                addAuthorizationCodeHeader({
                  authorizationCode: signInResponse.data.serverAuthCode,
                  fetchOptions,
                }),
              ),
            errors: [
              AccountNotLinkedError,
              EmailNotSharedError,
              RateLimitedError,
            ],
          });
        },
        Effect.catchTag("GoogleSignInInProgressError", () => Effect.void),
      );

      const signInWithOtpCode = Effect.fn(
        "AuthenticationApplicationService.signInWithOtpCode",
      )(function* ({ email, otpCode }: { email: string; otpCode: string }) {
        yield* authenticationClient.request({
          call: ({ authClient, fetchOptions }) =>
            authClient.signIn.emailOtp({ email, otp: otpCode }, fetchOptions),
          errors: [
            OtpCodeAttemptsExceededError,
            OtpCodeExpiredError,
            OtpCodeInvalidError,
            RateLimitedError,
          ],
        });
      });

      const signOut = Effect.fn("AuthenticationApplicationService.signOut")(
        function* () {
          yield* authenticationClient.request({
            call: ({ authClient, fetchOptions }) =>
              authClient.signOut({ fetchOptions }),
            errors: [],
          });

          yield* googleSignIn.signOut();
          // A countdown lives only in the device's memory and ends with the
          // session, while the Workout stays in progress on the server
          // (https://github.com/manuelcattelan/ankaa/issues/86).
          yield* notifications.cancelAllScheduled();
        },
      );

      const deleteAccount = Effect.fn(
        "AuthenticationApplicationService.deleteAccount",
      )(function* ({ token }: { token: string }) {
        yield* authenticationClient.request({
          call: ({ authClient, fetchOptions }) =>
            authClient.deleteUser({ fetchOptions, token }),
          errors: [DeleteAccountTokenInvalidError, RateLimitedError],
        });

        // better-auth deletes the Account through an inner call whose
        // cookie-clearing headers never reach the response
        // (https://github.com/better-auth/better-auth/blob/v1.7.5/packages/better-auth/src/api/routes/update-user.ts),
        // and the Expo client clears the cookie and the session it stores
        // only on sign-out
        // (https://github.com/better-auth/better-auth/blob/v1.7.5/packages/expo/src/client.ts),
        // so signing out is what removes the User's data from the device.
        yield* signOut();
      });

      return AuthenticationApplicationService.of({
        deleteAccount,
        requestAccountDeletion,
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
        Notifications.layer,
      ),
    ),
  );
}
