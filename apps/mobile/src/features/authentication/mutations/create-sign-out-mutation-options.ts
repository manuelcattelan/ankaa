import { mutationOptions } from "@tanstack/react-query";

import type { ApplicationRuntime } from "#/layer.ts";

import { signOut } from "#/features/authentication/interactors/sign-out.ts";

export function createSignOutMutationOptions(runtime: ApplicationRuntime) {
  return mutationOptions({
    mutationFn: () => runtime.runPromise(signOut()),
  });
}
