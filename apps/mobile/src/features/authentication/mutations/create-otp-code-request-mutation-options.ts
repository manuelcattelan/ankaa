import { mutationOptions } from "@tanstack/react-query";

import type { ApplicationRuntime } from "@/layer";

import { requestOtpCode } from "@/features/authentication/interactors/request-otp-code";

type OtpCodeRequestVariables = {
  email: string;
};

export function createOtpCodeRequestMutationOptions(
  runtime: ApplicationRuntime,
) {
  return mutationOptions({
    mutationFn: (otpCodeRequestVariables: OtpCodeRequestVariables) =>
      runtime.runPromise(requestOtpCode(otpCodeRequestVariables)),
    mutationKey: ["otp-code-request"],
  });
}
