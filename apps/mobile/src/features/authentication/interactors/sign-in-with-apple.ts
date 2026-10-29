import type * as ExpoAppleAuthentication from "expo-apple-authentication";

import * as Effect from "effect/Effect";

import { AppleSignIn } from "#/features/authentication/services/apple-sign-in.ts";
import { AuthenticationError } from "#/shared/errors/authentication-error.ts";
import { AuthenticationClient } from "#/shared/services/authentication-client.ts";
import { Crypto } from "#/shared/services/crypto.ts";

type BuildAppleIdTokenOptions = {
  credential: ExpoAppleAuthentication.AppleAuthenticationCredential;
  identityToken: string;
  nonce: string;
};

export const signInWithApple = Effect.fn("signInWithApple")(function* () {
  const appleSignIn = yield* AppleSignIn;
  const authenticationClient = yield* AuthenticationClient;
  const crypto = yield* Crypto;

  const nonce = yield* crypto.createRandomUuid();
  const hashedNonce = yield* crypto.createSha256Digest(nonce);

  const credential = yield* appleSignIn.signIn(hashedNonce);

  if (!credential.identityToken) {
    return yield* new AuthenticationError({
      message: "Failed to receive an identity token from Apple",
    });
  }

  const appleIdToken = buildAppleIdToken({
    credential,
    identityToken: credential.identityToken,
    nonce,
  });

  return yield* authenticationClient.request(
    (betterAuthenticationClient, fetchOptions) =>
      betterAuthenticationClient.signIn.social(
        { idToken: appleIdToken, provider: "apple" },
        fetchOptions,
      ),
  );
});

function buildAppleIdToken({
  credential,
  identityToken,
  nonce,
}: BuildAppleIdTokenOptions) {
  const firstName = credential.fullName?.givenName ?? undefined;
  const lastName = credential.fullName?.familyName ?? undefined;

  return {
    nonce,
    token: identityToken,
    user:
      (firstName ?? lastName) ? { name: { firstName, lastName } } : undefined,
  };
}
