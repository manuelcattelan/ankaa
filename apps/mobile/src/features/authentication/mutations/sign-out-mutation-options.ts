import { mutationOptions } from "@tanstack/react-query";
import * as Effect from "effect/Effect";

import type { ApplicationRuntime } from "#/layer.ts";

import { AuthenticationApplicationService } from "#/features/authentication/authentication-application-service.ts";

const program = Effect.fn("signOutMutation")(function* () {
  const authenticationApplicationService =
    yield* AuthenticationApplicationService;

  yield* authenticationApplicationService.signOut();
});

export function signOutMutationOptions(runtime: ApplicationRuntime) {
  return mutationOptions<
    Effect.Success<ReturnType<typeof program>>,
    Effect.Error<ReturnType<typeof program>>
  >({
    mutationFn: () => runtime.runPromise(program()),
  });
}
