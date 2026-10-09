import type { AppRouter } from "@ankaa/api";
import type { Persister } from "@tanstack/react-query-persist-client";

import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import {
  focusManager,
  onlineManager,
  QueryClient,
  useIsRestoring,
  useQueryClient,
} from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import expoConstants from "expo-constants";
import * as ExpoNetwork from "expo-network";
import * as ExpoSqliteKeyValueStore from "expo-sqlite/kv-store";
import { useEffect, useState } from "react";
import { AppState, Platform } from "react-native";

import { authenticationClient } from "@/clients/authentication";
import { TrpcProvider } from "@/clients/trpc";
import { environment } from "@/environment";

type QueryCacheControllerProperties = {
  queryPersister: Persister;
};

type QueryProviderProperties = {
  children: React.ReactNode;
};

const QUERY_STALE_TIME_MILLISECONDS = 60_000;

onlineManager.setEventListener((setOnline) => {
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
});

export function QueryProvider({ children }: QueryProviderProperties) {
  const [queryClient] = useState(createQueryClient);
  const [queryPersister] = useState(createQueryPersister);
  const [trpcClient] = useState(createTrpcClient);

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
        {children}
      </TrpcProvider>
    </PersistQueryClientProvider>
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

function createTrpcClient() {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        fetch: (url, options) =>
          fetch(url, { ...options, credentials: "omit" }),
        headers: async () => {
          const cookies = await authenticationClient.getCookie();

          return cookies ? { cookie: cookies } : {};
        },
        url: `${environment.EXPO_PUBLIC_API_URL}/trpc`,
      }),
    ],
  });
}

function QueryCacheController({
  queryPersister,
}: QueryCacheControllerProperties) {
  const isRestoring = useIsRestoring();

  const queryClient = useQueryClient();

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
