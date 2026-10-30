import { Stack } from "expo-router";
import { View } from "react-native";

import { LinkButton } from "#/shared/components/link-button.tsx";
import { Text } from "#/shared/components/text.tsx";
import { SHARED_MESSAGES } from "#/shared/messages/shared-messages.ts";

export function NotFoundScreen() {
  return (
    <View>
      <Stack.Screen
        options={{
          headerShown: true,
          title: SHARED_MESSAGES.notFoundScreenTitle,
        }}
      />
      <Text>{SHARED_MESSAGES.notFoundScreenBody}</Text>
      <LinkButton href="/" title={SHARED_MESSAGES.goHomeButton} />
    </View>
  );
}
