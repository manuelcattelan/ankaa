import { mutationOptions } from "@tanstack/react-query";

import type { RequestOtpCodeOptions } from "#/features/authentication/interactors/request-otp-code.ts";
import type { ApplicationRuntime } from "#/layer.ts";

import { requestOtpCode } from "#/features/authentication/interactors/request-otp-code.ts";

export function otpCodeRequestMutationOptions(runtime: ApplicationRuntime) {
  return mutationOptions({
    mutationFn: (requestOtpCodeOptions: RequestOtpCodeOptions) =>
      runtime.runPromise(requestOtpCode(requestOtpCodeOptions)),
  });
}
