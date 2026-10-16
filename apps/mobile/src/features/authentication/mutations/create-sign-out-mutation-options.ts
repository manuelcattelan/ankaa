import { mutationOptions } from "@tanstack/react-query";

import type { ApplicationRuntime } from "@/layer";

import { signOut } from "@/features/authentication/interactors/sign-out";

export function createSignOutMutationOptions(runtime: ApplicationRuntime) {
  return mutationOptions({
    mutationFn: () => runtime.runPromise(signOut()),
    mutationKey: ["sign-out"],
  });
}
