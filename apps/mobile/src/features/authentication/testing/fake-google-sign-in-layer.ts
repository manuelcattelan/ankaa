import type { SignInResponse } from "@react-native-google-signin/google-signin";

import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { GoogleSignIn } from "#/features/authentication/services/google-sign-in.ts";

/**
 * Answers Google sign-in with `signInResponse`, and records the name of every
 * method the app calls into `receivedCalls`.
 */
export function fakeGoogleSignInLayer({
  receivedCalls = [],
  signInResponse,
}: {
  receivedCalls?: string[];
  signInResponse?: SignInResponse;
}) {
  return Layer.succeed(
    GoogleSignIn,
    GoogleSignIn.of({
      checkPlayServices: () =>
        Effect.sync(() => {
          receivedCalls.push("checkPlayServices");

          return true;
        }),
      signIn: () =>
        Effect.suspend(() => {
          receivedCalls.push("signIn");

          return signInResponse === undefined
            ? Effect.die(new Error("No fake Google sign-in response"))
            : Effect.succeed(signInResponse);
        }),
      signOut: () =>
        Effect.sync(() => {
          receivedCalls.push("signOut");
        }),
    }),
  );
}
