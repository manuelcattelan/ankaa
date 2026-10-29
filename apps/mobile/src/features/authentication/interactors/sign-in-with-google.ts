import * as Effect from "effect/Effect";

import { GoogleSignInCanceledError } from "#/features/authentication/errors/google-sign-in-canceled-error.ts";
import { GoogleSignIn } from "#/features/authentication/services/google-sign-in.ts";
import { AuthenticationClientError } from "#/shared/errors/authentication-client-error.ts";
import { AuthenticationClient } from "#/shared/services/authentication-client.ts";

export const signInWithGoogle = Effect.fn("signInWithGoogle")(function* () {
  const authenticationClient = yield* AuthenticationClient;
  const googleSignIn = yield* GoogleSignIn;

  yield* googleSignIn.checkPlayServices();

  const signInResponse = yield* googleSignIn.signIn();

  if (signInResponse.type !== "success") {
    return yield* new GoogleSignInCanceledError();
  }

  const idToken = signInResponse.data.idToken;

  if (!idToken) {
    return yield* new AuthenticationClientError({
      cause: null,
      code: null,
      message: "Failed to receive an identity token from Google",
      retryAfterSeconds: null,
      status: null,
    });
  }

  return yield* authenticationClient.request((authClient, fetchOptions) =>
    authClient.signIn.social(
      { idToken: { token: idToken }, provider: "google" },
      fetchOptions,
    ),
  );
});
