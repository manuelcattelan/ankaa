import { mutationOptions } from "@tanstack/react-query";

import type { SignInWithOtpCodeOptions } from "#/features/authentication/interactors/sign-in-with-otp-code.ts";
import type { ApplicationRuntime } from "#/layer.ts";

import { signInWithOtpCode } from "#/features/authentication/interactors/sign-in-with-otp-code.ts";

export function otpCodeSignInMutationOptions(runtime: ApplicationRuntime) {
  return mutationOptions({
    mutationFn: (signInWithOtpCodeOptions: SignInWithOtpCodeOptions) =>
      runtime.runPromise(signInWithOtpCode(signInWithOtpCodeOptions)),
  });
}
