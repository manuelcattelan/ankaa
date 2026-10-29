import { mutationOptions } from "@tanstack/react-query";
import * as Effect from "effect/Effect";

import type { ApplicationRuntime } from "#/layer.ts";

import { AuthenticationApplicationService } from "#/features/authentication/authentication-application-service.ts";

const program = Effect.fn("accountDeletionMutation")(function* (variables: {
  token: string;
}) {
  const authenticationApplicationService =
    yield* AuthenticationApplicationService;

  yield* authenticationApplicationService.deleteAccount(variables);
});

export function accountDeletionMutationOptions(runtime: ApplicationRuntime) {
  return mutationOptions({
    // The mutation cache keeps a mutation's variables for `gcTime` after its
    // screen unmounts (https://tanstack.com/query/v5/docs/framework/react/reference/useMutation),
    // and the deletion token must not outlive its screen.
    gcTime: 0,
    mutationFn: (variables: { token: string }) =>
      runtime.runPromise(program(variables)),
  });
}
