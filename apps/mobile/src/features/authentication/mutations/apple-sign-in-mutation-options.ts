import { mutationOptions } from "@tanstack/react-query";
import * as Effect from "effect/Effect";

import type { ApplicationRuntime } from "#/layer.ts";

import { AuthenticationApplicationService } from "#/features/authentication/authentication-application-service.ts";

const program = Effect.fn("appleSignInMutation")(function* () {
  const authenticationApplicationService =
    yield* AuthenticationApplicationService;

  yield* authenticationApplicationService.signInWithApple();
});

export function appleSignInMutationOptions(runtime: ApplicationRuntime) {
  return mutationOptions<
    Effect.Success<ReturnType<typeof program>>,
    Effect.Error<ReturnType<typeof program>>
  >({
    mutationFn: () => runtime.runPromise(program()),
  });
}
