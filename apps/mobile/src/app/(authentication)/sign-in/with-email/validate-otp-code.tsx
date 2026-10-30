import { useLocalSearchParams } from "expo-router";

import { ValidateOtpCodeScreen } from "#/features/authentication/screens/validate-otp-code-screen.tsx";

type ValidateOtpCodeSearchParameters = {
  email?: string;
};

export default function ValidateOtpCodeRoute() {
  const searchParameters =
    useLocalSearchParams<ValidateOtpCodeSearchParameters>();

  return <ValidateOtpCodeScreen email={searchParameters.email ?? null} />;
}
