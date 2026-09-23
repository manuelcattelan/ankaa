import type { AppRouter } from "@ankaa/api";

import {
  focusManager,
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import * as ExpoNetwork from "expo-network";
import { useEffect, useState } from "react";
import { AppState, Platform } from "react-native";

import { authenticationClient } from "@/clients/authentication";
import { TrpcProvider } from "@/clients/trpc";
import { environment } from "@/environment";

type QueryProviderProperties = {
  children: React.ReactNode;
};

const QUERY_STALE_TIME_MILLISECONDS = 60_000;

onlineManager.setEventListener((setOnline) => {
  let isInitialized = false;

  const subscription = ExpoNetwork.addNetworkStateListener((state) => {
    isInitialized = true;
    setOnline(!!state.isConnected);
  });

  async function setInitialOnlineState() {
    const state = await ExpoNetwork.getNetworkStateAsync();

    if (!isInitialized) {
      setOnline(!!state.isConnected);
    }
  }

  void setInitialOnlineState();

  return () => {
    subscription.remove();
  };
});

export function QueryProvider({ children }: QueryProviderProperties) {
  const [queryClient] = useState(createQueryClient);
  const [trpcClient] = useState(createTrpcClient);

  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }

    const subscription = AppState.addEventListener("change", (status) => {
      focusManager.setFocused(status === "active");
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TrpcProvider queryClient={queryClient} trpcClient={trpcClient}>
        {children}
      </TrpcProvider>
    </QueryClientProvider>
  );
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: QUERY_STALE_TIME_MILLISECONDS } },
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
