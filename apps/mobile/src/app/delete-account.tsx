import { useLocalSearchParams } from "expo-router";

import { DeleteAccountScreen } from "#/features/authentication/screens/delete-account-screen.tsx";

type DeleteAccountSearchParameters = {
  token?: string;
};

export default function DeleteAccountRoute() {
  const searchParameters =
    useLocalSearchParams<DeleteAccountSearchParameters>();

  return <DeleteAccountScreen token={searchParameters.token ?? null} />;
}
