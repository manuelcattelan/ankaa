import { Stack } from "expo-router";
import { View } from "react-native";

import { LinkButton } from "@/shared/components/link-button";
import { Text } from "@/shared/components/text";
import { notFoundScreenMessages } from "@/shared/messages/not-found-screen-messages";

export function NotFoundScreen() {
  return (
    <View>
      <Stack.Screen
        options={{ headerShown: true, title: notFoundScreenMessages.title }}
      />
      <Text>{notFoundScreenMessages.body}</Text>
      <LinkButton href="/" title={notFoundScreenMessages.goHomeButton} />
    </View>
  );
}
