import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ExpoAppleAuthentication from "expo-apple-authentication";

import type { AppleSignInCanceledError } from "#/features/authentication/errors/apple-sign-in-canceled-error.ts";

import { getAppleSignInError } from "#/features/authentication/core/get-apple-sign-in-error.ts";

export class AppleSignIn extends Context.Service<
  AppleSignIn,
  {
    readonly signIn: (
      hashedNonce: string,
    ) => Effect.Effect<
      ExpoAppleAuthentication.AppleAuthenticationCredential,
      AppleSignInCanceledError
    >;
  }
>()("@ankaa/mobile/features/authentication/services/AppleSignIn") {
  static readonly layer = Layer.effect(
    AppleSignIn,
    Effect.sync(() => {
      function signIn(hashedNonce: string) {
        return Effect.promise(() =>
          ExpoAppleAuthentication.signInAsync({
            nonce: hashedNonce,
            requestedScopes: [
              ExpoAppleAuthentication.AppleAuthenticationScope.FULL_NAME,
              ExpoAppleAuthentication.AppleAuthenticationScope.EMAIL,
            ],
          }),
        ).pipe(Effect.catchDefect(failWithAppleSignInError));
      }

      return AppleSignIn.of({ signIn });
    }),
  );
}

function failWithAppleSignInError(defect: unknown) {
  const appleSignInError = getAppleSignInError(defect);

  return appleSignInError === null
    ? Effect.die(defect)
    : Effect.fail(appleSignInError);
}
