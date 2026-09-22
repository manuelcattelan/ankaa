import { GoogleSignin } from "@react-native-google-signin/google-signin";
import {
  DarkTheme,
  DefaultTheme,
  SplashScreen,
  Stack,
  ThemeProvider,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Text, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { env } from "@/env";
import { authClient } from "@/lib/auth";
import { QueryProvider } from "@/providers/query";

void SplashScreen.preventAutoHideAsync();
GoogleSignin.configure({
  iosClientId: env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  webClientId: env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

export function ErrorBoundary() {
  const colorScheme = useColorScheme();
  const { colors } = colorScheme === "dark" ? DarkTheme : DefaultTheme;
  return (
    <SafeAreaView>
      <Text selectable style={{ color: colors.text }}>
        Oops! Something went wrong.
      </Text>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <QueryProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <SplashScreenController />
        <RootNavigator />
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryProvider>
  );
}

function RootNavigator() {
  const { data: session } = authClient.useSession();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

function SplashScreenController() {
  const { isPending } = authClient.useSession();
  useEffect(() => {
    if (!isPending) {
      SplashScreen.hide();
    }
  }, [isPending]);
  return null;
}
