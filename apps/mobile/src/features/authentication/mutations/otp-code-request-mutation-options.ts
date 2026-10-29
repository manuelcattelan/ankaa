import { mutationOptions } from "@tanstack/react-query";
import * as Effect from "effect/Effect";

import type { ApplicationRuntime } from "#/layer.ts";

import { AuthenticationApplicationService } from "#/features/authentication/authentication-application-service.ts";

const program = Effect.fn("otpCodeRequestMutation")(function* (variables: {
  email: string;
}) {
  const authenticationApplicationService =
    yield* AuthenticationApplicationService;

  yield* authenticationApplicationService.requestOtpCode(variables);
});

export function otpCodeRequestMutationOptions(runtime: ApplicationRuntime) {
  return mutationOptions({
    mutationFn: (variables: { email: string }) =>
      runtime.runPromise(program(variables)),
  });
}
