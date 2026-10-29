import { mutationOptions } from "@tanstack/react-query";

import type { RequestOtpCodeOptions } from "@/features/authentication/interactors/request-otp-code";
import type { ApplicationRuntime } from "@/layer";

import { requestOtpCode } from "@/features/authentication/interactors/request-otp-code";

export function createOtpCodeRequestMutationOptions(
  runtime: ApplicationRuntime,
) {
  return mutationOptions({
    mutationFn: (requestOtpCodeOptions: RequestOtpCodeOptions) =>
      runtime.runPromise(requestOtpCode(requestOtpCodeOptions)),
  });
}
