import type { MutationKey, UseMutationOptions } from "@tanstack/react-query";
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

import type { ApplicationRuntime } from "@/layer";

import { createAppleSignInMutationOptions } from "@/features/authentication/mutations/create-apple-sign-in-mutation-options";
import { createGoogleSignInMutationOptions } from "@/features/authentication/mutations/create-google-sign-in-mutation-options";
import { createOtpCodeRequestMutationOptions } from "@/features/authentication/mutations/create-otp-code-request-mutation-options";
import { createOtpCodeSignInMutationOptions } from "@/features/authentication/mutations/create-otp-code-sign-in-mutation-options";
import { createSignOutMutationOptions } from "@/features/authentication/mutations/create-sign-out-mutation-options";
import { createRoutineDeleteMutationOptions } from "@/features/routine/mutations/create-routine-delete-mutation-options";
import { createRoutineSaveMutationOptions } from "@/features/routine/mutations/create-routine-save-mutation-options";
import { requestNotificationPermission } from "@/features/workout/interactors/request-notification-permission";
import { createWorkoutSaveMutationOptions } from "@/features/workout/mutations/create-workout-save-mutation-options";
import { WorkoutDocumentsProvider } from "@/features/workout/providers/workout-documents-provider";
import { applicationLayer } from "@/layer";
import { Text } from "@/shared/components/text";
import { useAuthenticationSession } from "@/shared/hooks/use-authentication-session";
import { errorMessages } from "@/shared/messages/error-messages";
import { RuntimeContext } from "@/shared/providers/runtime-context";

type MutationDefaultKey = {
  mutationKey: MutationKey;
};

type QueryCacheControllerProperties = {
  queryPersister: Persister;
};

type RegisterMutationDefaultsOptions = {
  queryClient: QueryClient;
  runtime: ApplicationRuntime;
};

type SetMutationDefaultOptions<TData, TError, TVariables, TOnMutateResult> = {
  mutationOptions: MutationDefaultKey &
    UseMutationOptions<TData, TError, TVariables, TOnMutateResult>;
  queryClient: QueryClient;
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

  const [runtime] = useState(createRuntime);
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

function registerMutationDefaults({
  queryClient,
  runtime,
}: RegisterMutationDefaultsOptions) {
  setMutationDefault({
    mutationOptions: createAppleSignInMutationOptions(runtime),
    queryClient,
  });

  setMutationDefault({
    mutationOptions: createGoogleSignInMutationOptions(runtime),
    queryClient,
  });

  setMutationDefault({
    mutationOptions: createOtpCodeRequestMutationOptions(runtime),
    queryClient,
  });

  setMutationDefault({
    mutationOptions: createOtpCodeSignInMutationOptions(runtime),
    queryClient,
  });

  setMutationDefault({
    mutationOptions: createRoutineDeleteMutationOptions(runtime),
    queryClient,
  });

  setMutationDefault({
    mutationOptions: createRoutineSaveMutationOptions(runtime),
    queryClient,
  });

  setMutationDefault({
    mutationOptions: createSignOutMutationOptions(runtime),
    queryClient,
  });

  setMutationDefault({
    mutationOptions: createWorkoutSaveMutationOptions(runtime),
    queryClient,
  });
}

function RootNavigator() {
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

function setMutationDefault<TData, TError, TVariables, TOnMutateResult>({
  mutationOptions,
  queryClient,
}: SetMutationDefaultOptions<TData, TError, TVariables, TOnMutateResult>) {
  queryClient.setMutationDefaults(mutationOptions.mutationKey, mutationOptions);
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
