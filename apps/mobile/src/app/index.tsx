import { Button, Text, View } from "react-native";

import { authClient } from "@/lib/auth";

export default function Index() {
  const { data: session } = authClient.useSession();
  return (
    <View>
      <Text>{session?.user.email}</Text>
      <Button onPress={() => void authClient.signOut()} title="Sign out" />
    </View>
  );
}
