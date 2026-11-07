import type { Theme } from "expo-router";
import type { ColorSchemeName } from "react-native";

import {
  focusManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import * as Context from "effect/Context";
import { DefaultTheme, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { AppState, useColorScheme } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import { applicationLayer, createRuntime } from "#/layer.ts";
import { QueryCacheController } from "#/query-cache-controller.tsx";
import { RootNavigator } from "#/root-navigator.tsx";
import { Text } from "#/shared/components/text.tsx";
import { SHARED_MESSAGES } from "#/shared/messages/shared-messages.ts";
import { AuthClientContext } from "#/shared/providers/auth-client-context.ts";
import { RuntimeContext } from "#/shared/providers/runtime-context.ts";
import { TokenProvider } from "#/shared/providers/token-provider.tsx";
import { AuthenticationClient } from "#/shared/services/authentication-client.ts";
import { color } from "#/shared/tokens/color.ts";
import { SplashScreenController } from "#/splash-screen-controller.tsx";

// Spreading DefaultTheme keeps the system fonts, which nothing Ankaa renders
// reads, because every Stack hides its header.
const lightNavigationTheme = {
  ...DefaultTheme,
  colors: {
    background: color.background,
    border: color.separator,
    card: color.background,
    notification: color.dangerFill,
    primary: color.accentForeground,
    text: color.foreground,
  },
  dark: false,
} satisfies Theme;

// Each color follows appearance on its own, so this theme differs only in
// `dark`, which then never tells a reader the wrong appearance.
const darkNavigationTheme = {
  ...lightNavigationTheme,
  dark: true,
} satisfies Theme;

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
      <TokenProvider>
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
      </TokenProvider>
    </RuntimeContext>
  );
}

function createApplicationRuntime() {
  return createRuntime(applicationLayer);
}

function createQueryClient() {
  return new QueryClient();
}

function getNavigationTheme(colorScheme: ColorSchemeName | null) {
  return colorScheme === "dark" ? darkNavigationTheme : lightNavigationTheme;
}
