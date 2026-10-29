import { useLocalSearchParams } from "expo-router";

import { SignInScreen } from "#/features/authentication/screens/sign-in-screen.tsx";

type SignInSearchParameters = {
  isAccountDeleted?: string;
};

export default function SignInRoute() {
  const searchParameters = useLocalSearchParams<SignInSearchParameters>();

  return (
    <SignInScreen
      isAccountDeleted={searchParameters.isAccountDeleted === "true"}
    />
  );
}
