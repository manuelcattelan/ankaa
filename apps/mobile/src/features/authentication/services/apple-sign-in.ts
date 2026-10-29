import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Predicate from "effect/Predicate";
import * as ExpoAppleAuthentication from "expo-apple-authentication";

import { REQUEST_CANCELED_ERROR_CODE } from "#/features/authentication/constants/request-canceled-error-code.ts";
import { AppleSignInCanceledError } from "#/features/authentication/errors/apple-sign-in-canceled-error.ts";

type AppleSignInTestOptions = {
  appleAuthenticationCredential?: ExpoAppleAuthentication.AppleAuthenticationCredential;
  isAvailable: boolean;
};

export class AppleSignIn extends Context.Service<AppleSignIn>()(
  "@ankaa/mobile/features/authentication/services/AppleSignIn",
  {
    make: Effect.sync(() => {
      function checkAvailability() {
        return Effect.promise(() => ExpoAppleAuthentication.isAvailableAsync());
      }

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

      return { checkAvailability, signIn };
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make);

  static readonly layerTest = ({
    appleAuthenticationCredential,
    isAvailable,
  }: AppleSignInTestOptions) =>
    Layer.succeed(
      this,
      this.of({
        checkAvailability: () => Effect.succeed(isAvailable),
        signIn: () =>
          appleAuthenticationCredential
            ? Effect.succeed(appleAuthenticationCredential)
            : Effect.fail(new AppleSignInCanceledError()),
      }),
    );
}

function failWithAppleSignInError(defect: unknown) {
  if (
    Predicate.hasProperty(defect, "code") &&
    defect.code === REQUEST_CANCELED_ERROR_CODE
  ) {
    return Effect.fail(new AppleSignInCanceledError());
  }

  return Effect.die(defect);
}
