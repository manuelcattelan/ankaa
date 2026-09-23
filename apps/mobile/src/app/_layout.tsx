import type { ColorSchemeName } from "react-native";

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
import { useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authenticationClient } from "@/clients/authentication";
import { Text } from "@/components/text";
import { environment } from "@/environment";
import { QueryProvider } from "@/providers/query";
import { messages } from "@/utilities/messages";

void SplashScreen.preventAutoHideAsync();

GoogleSignin.configure({
  iosClientId: environment.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  webClientId: environment.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

export function ErrorBoundary() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={getNavigationTheme(colorScheme)}>
      <SafeAreaView>
        <Text selectable>{messages.root.errorBoundary}</Text>
      </SafeAreaView>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryProvider>
      <ThemeProvider value={getNavigationTheme(colorScheme)}>
        <SplashScreenController />
        <RootNavigator />
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryProvider>
  );
}

function getNavigationTheme(colorScheme: ColorSchemeName) {
  return colorScheme === "dark" ? DarkTheme : DefaultTheme;
}

function RootNavigator() {
  const session = authenticationClient.useSession();

  const hasSession = !!session.data;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={hasSession}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!hasSession}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

function SplashScreenController() {
  const session = authenticationClient.useSession();

  useEffect(() => {
    if (!session.isPending) {
      SplashScreen.hide();
    }
  }, [session.isPending]);

  return null;
}
