import { mutationOptions } from "@tanstack/react-query";
import * as Effect from "effect/Effect";

import type { ApplicationRuntime } from "@/layer";

import { signInWithGoogle } from "@/features/authentication/interactors/sign-in-with-google";

export function createGoogleSignInMutationOptions(runtime: ApplicationRuntime) {
  return mutationOptions({
    mutationFn: () =>
      runtime.runPromise(
        signInWithGoogle().pipe(
          Effect.catchTag("GoogleSignInCanceledError", () => Effect.void),
        ),
      ),
    mutationKey: ["google-sign-in"],
  });
}
