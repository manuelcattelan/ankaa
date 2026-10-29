import { mutationOptions } from "@tanstack/react-query";
import * as Effect from "effect/Effect";

import type { ApplicationRuntime } from "#/layer.ts";

import { AuthenticationApplicationService } from "#/features/authentication/authentication-application-service.ts";

const program = Effect.fn("otpCodeSignInMutation")(function* (variables: {
  email: string;
  otpCode: string;
}) {
  const authenticationApplicationService =
    yield* AuthenticationApplicationService;

  yield* authenticationApplicationService.signInWithOtpCode(variables);
});

export function otpCodeSignInMutationOptions(runtime: ApplicationRuntime) {
  return mutationOptions({
    mutationFn: (variables: { email: string; otpCode: string }) =>
      runtime.runPromise(program(variables)),
  });
}
