import { Stack } from "expo-router";
import { View } from "react-native";

import { LinkButton } from "#/shared/components/link-button.tsx";
import { Text } from "#/shared/components/text.tsx";
import { notFoundScreenMessages } from "#/shared/messages/not-found-screen-messages.ts";

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
