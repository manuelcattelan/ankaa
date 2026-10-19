import type { Persister } from "@tanstack/react-query-persist-client";
import type { ColorSchemeName } from "react-native";

import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import {
  focusManager,
  onlineManager,
  QueryClient,
  useIsRestoring,
  useQueryClient,
} from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import expoConstants from "expo-constants";
import * as ExpoNetwork from "expo-network";
import * as ExpoNotifications from "expo-notifications";
import {
  DarkTheme,
  DefaultTheme,
  SplashScreen,
  ThemeProvider,
} from "expo-router";
import * as ExpoSqliteKeyValueStore from "expo-sqlite/kv-store";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { AppState, Platform, useColorScheme } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import { registerMutationDefaults } from "@/defaults";
import { requestNotificationPermission } from "@/features/workout/interactors/request-notification-permission";
import { WorkoutDocumentsProvider } from "@/features/workout/providers/workout-documents-provider";
import { applicationLayer, createRuntime } from "@/layer";
import { RootNavigator } from "@/root";
import { Text } from "@/shared/components/text";
import { useAuthenticationSession } from "@/shared/hooks/use-authentication-session";
import { errorMessages } from "@/shared/messages/error-messages";
import { RuntimeContext } from "@/shared/providers/runtime-context";

type QueryCacheControllerProperties = {
  queryPersister: Persister;
};

const QUERY_STALE_TIME_MILLISECONDS = 60_000;

export function ErrorBoundary() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={getNavigationTheme(colorScheme)}>
      <SafeAreaView>
        <Text selectable>{errorMessages.unknown}</Text>
      </SafeAreaView>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [runtime] = useState(createApplicationRuntime);
  const [queryClient] = useState(createQueryClient);
  const [queryPersister] = useState(createQueryPersister);

  useEffect(() => {
    registerMutationDefaults({ queryClient, runtime });
  }, [queryClient, runtime]);

  useEffect(() => {
    ExpoNotifications.setNotificationHandler({
      handleNotification: () =>
        Promise.resolve({
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
    });

    void runtime.runPromise(requestNotificationPermission());
  }, [runtime]);

  useEffect(() => {
    onlineManager.setEventListener(listenToNetworkState);
  }, []);

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
    <RuntimeContext value={runtime}>
      <KeyboardProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            buster: expoConstants.expoConfig?.version ?? "",
            dehydrateOptions: { shouldDehydrateMutation: () => false },
            maxAge: Infinity,
            persister: queryPersister,
          }}
        >
          <QueryCacheController queryPersister={queryPersister} />
          <WorkoutDocumentsProvider>
            <ThemeProvider value={getNavigationTheme(colorScheme)}>
              <SplashScreenController />
              <RootNavigator />
              <StatusBar style="auto" />
            </ThemeProvider>
          </WorkoutDocumentsProvider>
        </PersistQueryClientProvider>
      </KeyboardProvider>
    </RuntimeContext>
  );
}

function createApplicationRuntime() {
  return createRuntime(applicationLayer);
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { gcTime: Infinity, staleTime: QUERY_STALE_TIME_MILLISECONDS },
    },
  });
}

function createQueryPersister() {
  return createAsyncStoragePersister({
    storage: ExpoSqliteKeyValueStore.Storage,
  });
}

function getNavigationTheme(colorScheme: ColorSchemeName) {
  return colorScheme === "dark" ? DarkTheme : DefaultTheme;
}

function listenToNetworkState(setOnline: (isOnline: boolean) => void) {
  let isInitialized = false;

  const subscription = ExpoNetwork.addNetworkStateListener((networkState) => {
    isInitialized = true;
    setOnline(!!networkState.isConnected);
  });

  async function setInitialOnlineState() {
    const networkState = await ExpoNetwork.getNetworkStateAsync();

    if (!isInitialized) {
      setOnline(!!networkState.isConnected);
    }
  }

  void setInitialOnlineState();

  return () => {
    subscription.remove();
  };
}

function QueryCacheController({
  queryPersister,
}: QueryCacheControllerProperties) {
  const isRestoring = useIsRestoring();

  const queryClient = useQueryClient();

  const session = useAuthenticationSession();

  const hasSession = !!session.data;

  useEffect(() => {
    if (isRestoring || session.isPending || hasSession) {
      return;
    }

    queryClient.clear();
    void queryPersister.removeClient();
  }, [hasSession, isRestoring, queryClient, queryPersister, session.isPending]);

  return null;
}

function SplashScreenController() {
  const session = useAuthenticationSession();

  useEffect(() => {
    void SplashScreen.preventAutoHideAsync();
  }, []);

  useEffect(() => {
    if (!session.isPending) {
      SplashScreen.hide();
    }
  }, [session.isPending]);

  return null;
}
