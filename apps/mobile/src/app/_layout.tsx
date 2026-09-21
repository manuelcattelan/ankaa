import { SplashScreen, Stack } from "expo-router";

import { authClient } from "@/lib/auth";
import { QueryProvider } from "@/providers/query";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <QueryProvider>
      <SplashScreenController />
      <RootNavigator />
    </QueryProvider>
  );
}

function RootNavigator() {
  const { data: session } = authClient.useSession();
  return (
    <Stack>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="index" />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="sign-up" />
      </Stack.Protected>
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="verify-email" />
    </Stack>
  );
}

function SplashScreenController() {
  const { data: session, isPending } = authClient.useSession();
  if (!isPending || session) {
    SplashScreen.hide();
  }
  return null;
}
