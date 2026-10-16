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
import * as Cause from "effect/Cause";
import * as Exit from "effect/Exit";
import * as ManagedRuntime from "effect/ManagedRuntime";
import expoConstants from "expo-constants";
import * as ExpoNetwork from "expo-network";
import * as ExpoNotifications from "expo-notifications";
import {
  DarkTheme,
  DefaultTheme,
  SplashScreen,
  Stack,
  ThemeProvider,
} from "expo-router";
import * as ExpoSqliteKeyValueStore from "expo-sqlite/kv-store";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { AppState, Platform, useColorScheme } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import { TrpcProvider } from "@/clients/trpc";
import { applicationLayer } from "@/layer";
import { WorkoutDocumentsProvider } from "@/providers/workout-documents";
import { Text } from "@/shared/components/text";
import { useAuthenticationClient } from "@/shared/hooks/use-authentication-client";
import { RuntimeContext } from "@/shared/providers/runtime-context";
import { TrpcClient } from "@/shared/services/trpc-client";
import { messages } from "@/utilities/messages";

type QueryCacheControllerProperties = {
  queryPersister: Persister;
};

const QUERY_STALE_TIME_MILLISECONDS = 60_000;

export function ErrorBoundary() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={getNavigationTheme(colorScheme)}>
      <SafeAreaView>
        <Text selectable>{messages.error.unknown}</Text>
      </SafeAreaView>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [runtime] = useState(createRuntime);
  const [queryClient] = useState(createQueryClient);
  const [queryPersister] = useState(createQueryPersister);

  const trpcClient = runtime.runSync(TrpcClient);

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

    void requestNotificationPermission();
  }, []);

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
          <TrpcProvider queryClient={queryClient} trpcClient={trpcClient}>
            <WorkoutDocumentsProvider>
              <ThemeProvider value={getNavigationTheme(colorScheme)}>
                <SplashScreenController />
                <RootNavigator />
                <StatusBar style="auto" />
              </ThemeProvider>
            </WorkoutDocumentsProvider>
          </TrpcProvider>
        </PersistQueryClientProvider>
      </KeyboardProvider>
    </RuntimeContext>
  );
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

function createRuntime() {
  const runtime = ManagedRuntime.make(applicationLayer);

  const runtimeContextExit = runtime.runSyncExit(runtime.contextEffect);

  if (Exit.isFailure(runtimeContextExit)) {
    throw new Error(Cause.pretty(runtimeContextExit.cause));
  }

  return runtime;
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

  const authenticationClient = useAuthenticationClient();

  const session = authenticationClient.useSession();

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

async function requestNotificationPermission() {
  const notificationPermission = await ExpoNotifications.getPermissionsAsync();

  if (
    notificationPermission.status ===
    ExpoNotifications.PermissionStatus.UNDETERMINED
  ) {
    await ExpoNotifications.requestPermissionsAsync();
  }
}

function RootNavigator() {
  const authenticationClient = useAuthenticationClient();

  const session = authenticationClient.useSession();

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

function SplashScreenController() {
  const authenticationClient = useAuthenticationClient();

  const session = authenticationClient.useSession();

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
