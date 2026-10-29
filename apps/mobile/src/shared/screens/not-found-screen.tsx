import { Stack } from "expo-router";
import { View } from "react-native";

import { LinkButton } from "#/shared/components/link-button.tsx";
import { Text } from "#/shared/components/text.tsx";
import { NOT_FOUND_SCREEN_MESSAGES } from "#/shared/messages/not-found-screen-messages.ts";

export function NotFoundScreen() {
  return (
    <View>
      <Stack.Screen
        options={{ headerShown: true, title: NOT_FOUND_SCREEN_MESSAGES.title }}
      />
      <Text>{NOT_FOUND_SCREEN_MESSAGES.body}</Text>
      <LinkButton href="/" title={NOT_FOUND_SCREEN_MESSAGES.goHomeButton} />
    </View>
  );
}
