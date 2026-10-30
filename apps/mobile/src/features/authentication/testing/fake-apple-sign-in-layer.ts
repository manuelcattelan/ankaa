import type * as ExpoAppleAuthentication from "expo-apple-authentication";

import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { AppleSignInCanceledError } from "#/features/authentication/errors/apple-sign-in-canceled-error.ts";
import { AppleSignIn } from "#/features/authentication/services/apple-sign-in.ts";

/**
 * Signs in with `appleAuthenticationCredential`, or fails as a User who
 * cancels Apple sign-in when there's none.
 */
export function fakeAppleSignInLayer({
  appleAuthenticationCredential,
}: {
  appleAuthenticationCredential?: ExpoAppleAuthentication.AppleAuthenticationCredential;
}) {
  return Layer.succeed(
    AppleSignIn,
    AppleSignIn.of({
      signIn: () =>
        appleAuthenticationCredential === undefined
          ? Effect.fail(new AppleSignInCanceledError())
          : Effect.succeed(appleAuthenticationCredential),
    }),
  );
}
