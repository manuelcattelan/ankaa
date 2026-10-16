import { mutationOptions } from "@tanstack/react-query";

import type { ApplicationRuntime } from "@/layer";

import { signInWithOtpCode } from "@/features/authentication/interactors/sign-in-with-otp-code";

type OtpCodeSignInVariables = {
  email: string;
  otp: string;
};

export function createOtpCodeSignInMutationOptions(
  runtime: ApplicationRuntime,
) {
  return mutationOptions({
    mutationFn: (otpCodeSignInVariables: OtpCodeSignInVariables) =>
      runtime.runPromise(signInWithOtpCode(otpCodeSignInVariables)),
    mutationKey: ["otp-code-sign-in"],
  });
}
