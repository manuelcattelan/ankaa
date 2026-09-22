import type { AppRouter } from "@ankaa/api";
import type { AppStateStatus } from "react-native";

import {
  focusManager,
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import * as Network from "expo-network";
import { useEffect, useState } from "react";
import { AppState, Platform } from "react-native";

import { env } from "@/env";
import { authClient } from "@/lib/auth";
import { TRPCProvider } from "@/lib/trpc";

onlineManager.setEventListener((setOnline) => {
  let initialised = false;
  const eventSubscription = Network.addNetworkStateListener((state) => {
    initialised = true;
    setOnline(!!state.isConnected);
  });
  void Network.getNetworkStateAsync().then((state) => {
    if (!initialised) {
      setOnline(!!state.isConnected);
    }
  });
  return () => {
    eventSubscription.remove();
  };
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } }),
  );
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          fetch: (url, options) =>
            fetch(url, { ...options, credentials: "omit" }),
          async headers() {
            const cookies = await authClient.getCookie();
            return cookies ? { cookie: cookies } : {};
          },
          url: `${env.EXPO_PUBLIC_API_URL}/trpc`,
        }),
      ],
    }),
  );
  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }
    const subscription = AppState.addEventListener(
      "change",
      (status: AppStateStatus) => {
        focusManager.setFocused(status === "active");
      },
    );
    return () => {
      subscription.remove();
    };
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider queryClient={queryClient} trpcClient={trpcClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
