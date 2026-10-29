import { Stack } from "expo-router";
import { useState } from "react";

import { useAuthenticationSession } from "#/shared/hooks/use-authentication-session.ts";

export function RootNavigator() {
  const session = useAuthenticationSession();

  const [hasSessionSettled, setHasSessionSettled] = useState(false);

  const hasSession = session.data !== null;

  // The guards below send a link to a screen they hide to another screen, and
  // a session that hasn't loaded yet has no data, so rendering them before
  // the first session read settles would send a signed-in User's link to the
  // sign-in screen (https://docs.expo.dev/router/advanced/protected/). Only the
  // first read counts, because better-auth marks every later read of a
  // signed-out session as pending too
  // (https://github.com/better-auth/better-auth/blob/v1.7.5/packages/better-auth/src/client/session-atom.ts).
  if (!hasSessionSettled && !session.isPending) {
    setHasSessionSettled(true);
  }

  if (!hasSessionSettled) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={hasSession}>
        <Stack.Screen name="(application)" />
      </Stack.Protected>
      <Stack.Protected guard={!hasSession}>
        <Stack.Screen name="(authentication)" />
      </Stack.Protected>
      <Stack.Screen name="delete-account" />
    </Stack>
  );
}
