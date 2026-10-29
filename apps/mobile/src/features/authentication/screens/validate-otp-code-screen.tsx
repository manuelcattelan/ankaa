import { Redirect } from "expo-router";

import { ValidateOtpCodeForm } from "#/features/authentication/components/validate-otp-code-form.tsx";

export function ValidateOtpCodeScreen({ email }: { email: null | string }) {
  if (email === null || email === "") {
    return <Redirect href="/sign-in" />;
  }

  return <ValidateOtpCodeForm email={email} />;
}
