import { Stack } from "expo-router";

import { LinkButton } from "#/shared/components/link-button.tsx";
import { ScrollView } from "#/shared/components/scroll-view.tsx";
import { Text } from "#/shared/components/text.tsx";
import { SHARED_MESSAGES } from "#/shared/messages/shared-messages.ts";

export function NotFoundScreen() {
  return (
    <ScrollView>
      <Stack.Screen options={{ title: SHARED_MESSAGES.notFoundScreenTitle }} />
      <Text>{SHARED_MESSAGES.notFoundScreenBody}</Text>
      <LinkButton href="/" title={SHARED_MESSAGES.goHomeButton} />
    </ScrollView>
  );
}
