import { mutationOptions } from "@tanstack/react-query";

import type { SignInWithOtpCodeOptions } from "@/features/authentication/interactors/sign-in-with-otp-code";
import type { ApplicationRuntime } from "@/layer";

import { signInWithOtpCode } from "@/features/authentication/interactors/sign-in-with-otp-code";

export function createOtpCodeSignInMutationOptions(
  runtime: ApplicationRuntime,
) {
  return mutationOptions({
    mutationFn: (signInWithOtpCodeOptions: SignInWithOtpCodeOptions) =>
      runtime.runPromise(signInWithOtpCode(signInWithOtpCodeOptions)),
    mutationKey: ["otp-code-sign-in"],
  });
}
