import type * as ExpoAppleAuthentication from "expo-apple-authentication";

import * as Effect from "effect/Effect";

import { AppleSignIn } from "#/features/authentication/services/apple-sign-in.ts";
import { AuthenticationClientError } from "#/shared/errors/authentication-client-error.ts";
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
    return yield* new AuthenticationClientError({
      code: null,
      message: "Failed to receive an identity token from Apple",
      retryAfterSeconds: null,
      status: null,
    });
  }

  const appleIdToken = buildAppleIdToken({
    credential,
    identityToken: credential.identityToken,
    nonce,
  });

  return yield* authenticationClient.request((authClient, fetchOptions) =>
    authClient.signIn.social(
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
  const firstName = credential.fullName?.givenName ?? null;
  const lastName = credential.fullName?.familyName ?? null;
  const appleIdToken = { nonce, token: identityToken };

  if (!(firstName ?? lastName)) {
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
