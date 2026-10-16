import { mutationOptions } from "@tanstack/react-query";
import * as Effect from "effect/Effect";

import type { ApplicationRuntime } from "@/layer";

import { signInWithApple } from "@/features/authentication/interactors/sign-in-with-apple";

export function createAppleSignInMutationOptions(runtime: ApplicationRuntime) {
  return mutationOptions({
    mutationFn: () =>
      runtime.runPromise(
        signInWithApple().pipe(
          Effect.catchTag("AppleSignInCanceledError", () => Effect.void),
        ),
      ),
    mutationKey: ["apple-sign-in"],
  });
}
