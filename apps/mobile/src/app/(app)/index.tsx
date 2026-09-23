import { useMutation } from "@tanstack/react-query";
import { useTheme } from "expo-router";
import { Text, View } from "react-native";

import { Button } from "@/components/button";
import { authClient } from "@/lib/auth";

export default function Index() {
  const { colors } = useTheme();
  const { data: session } = authClient.useSession();
  const signOut = useMutation({ mutationFn: () => authClient.signOut() });
  function handleSignOut() {
    if (signOut.isPending) {
      return;
    }
    signOut.mutate();
  }
  return (
    <View>
      <Text style={{ color: colors.text }}>
        Signed in as {session?.user.email}
      </Text>
      <Button
        busy={signOut.isPending}
        onPress={handleSignOut}
        title="Sign out"
      />
    </View>
  );
}
