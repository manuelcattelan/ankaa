import { Stack } from "expo-router";

import { useAuthenticationSession } from "#/shared/hooks/use-authentication-session.ts";

export function RootNavigator() {
  const session = useAuthenticationSession();

  const hasSession = !!session.data;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={hasSession}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!hasSession}>
        <Stack.Screen name="(authentication)" />
      </Stack.Protected>
    </Stack>
  );
}
