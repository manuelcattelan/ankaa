import type { ColorSchemeName } from "react-native";

import {
  focusManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import * as Context from "effect/Context";
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { AppState, Platform, useColorScheme } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import { applicationLayer, createRuntime } from "#/layer.ts";
import { QueryCacheController } from "#/query-cache-controller.tsx";
import { RootNavigator } from "#/root-navigator.tsx";
import { Text } from "#/shared/components/text.tsx";
import { SHARED_MESSAGES } from "#/shared/messages/shared-messages.ts";
import { AuthClientContext } from "#/shared/providers/auth-client-context.ts";
import { RuntimeContext } from "#/shared/providers/runtime-context.ts";
import { AuthenticationClient } from "#/shared/services/authentication-client.ts";
import { SplashScreenController } from "#/splash-screen-controller.tsx";

export function ErrorBoundary() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={getNavigationTheme(colorScheme)}>
      <SafeAreaView>
        <Text selectable>{SHARED_MESSAGES.unknownError}</Text>
      </SafeAreaView>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [application] = useState(createApplicationRuntime);
  const [queryClient] = useState(createQueryClient);

  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }

    const subscription = AppState.addEventListener(
      "change",
      (appStateStatus) => {
        focusManager.setFocused(appStateStatus === "active");
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <RuntimeContext value={application.runtime}>
      <AuthClientContext
        value={
          Context.get(application.context, AuthenticationClient).authClient
        }
      >
        <KeyboardProvider>
          <QueryClientProvider client={queryClient}>
            <QueryCacheController />
            <ThemeProvider value={getNavigationTheme(colorScheme)}>
              <SplashScreenController />
              <RootNavigator />
              <StatusBar style="auto" />
            </ThemeProvider>
          </QueryClientProvider>
        </KeyboardProvider>
      </AuthClientContext>
    </RuntimeContext>
  );
}

function createApplicationRuntime() {
  return createRuntime(applicationLayer);
}

function createQueryClient() {
  return new QueryClient();
}

function getNavigationTheme(colorScheme: ColorSchemeName) {
  return colorScheme === "dark" ? DarkTheme : DefaultTheme;
}
