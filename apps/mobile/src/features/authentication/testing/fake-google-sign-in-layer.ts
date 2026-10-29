import type { SignInResponse } from "@react-native-google-signin/google-signin";

import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { GoogleSignIn } from "#/features/authentication/services/google-sign-in.ts";

export function fakeGoogleSignInLayer(googleSignInResponse: SignInResponse) {
  return Layer.succeed(
    GoogleSignIn,
    GoogleSignIn.of({
      checkPlayServices: () => Effect.succeed(true),
      signIn: () => Effect.succeed(googleSignInResponse),
    }),
  );
}
