import { useMutation } from "@tanstack/react-query";
import { View } from "react-native";

import { authenticationClient } from "@/clients/authentication";
import { Button } from "@/components/button";
import { Text } from "@/components/text";
import { messages } from "@/utilities/messages";

export default function AppScreen() {
  const session = authenticationClient.useSession();

  const signOut = useMutation({
    mutationFn: () => authenticationClient.signOut(),
  });

  function handleSignOut() {
    if (signOut.isPending) {
      return;
    }

    signOut.mutate();
  }

  return (
    <View>
      <Text>{messages.app.signedInAs(session.data?.user.email)}</Text>
      <Button
        isBusy={signOut.isPending}
        onPress={handleSignOut}
        title={messages.app.signOut}
      />
    </View>
  );
}
