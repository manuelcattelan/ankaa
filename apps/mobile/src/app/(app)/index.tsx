import { useMutation } from "@tanstack/react-query";
import { View } from "react-native";

import { authenticationClient } from "@/clients/authentication";
import { Button } from "@/components/button";
import { messages } from "@/utilities/messages";

export default function AppScreen() {
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
      <Button
        isBusy={signOut.isPending}
        onPress={handleSignOut}
        title={messages.app.signOut}
      />
    </View>
  );
}
