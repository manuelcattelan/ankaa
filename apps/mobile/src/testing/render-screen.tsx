import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Context from "effect/Context";
import { renderRouter } from "expo-router/testing-library";

import type { ApplicationRuntime } from "#/layer.ts";
import type { AuthClient } from "#/shared/services/make-authentication-client.ts";
import type { TestRuntimeLayers } from "#/testing/create-test-runtime.ts";

import { RootNavigator } from "#/root-navigator.tsx";
import { AuthClientContext } from "#/shared/providers/auth-client-context.ts";
import { RuntimeContext } from "#/shared/providers/runtime-context.ts";
import { AuthenticationClient } from "#/shared/services/authentication-client.ts";
import { createTestRuntime } from "#/testing/create-test-runtime.ts";

export function renderScreen({
  initialUrl,
  testRuntimeLayers = {},
}: {
  initialUrl: string;
  testRuntimeLayers?: TestRuntimeLayers;
}) {
  const testRuntime = createTestRuntime(testRuntimeLayers);

  const queryClient = new QueryClient({
    defaultOptions: { queries: { gcTime: Infinity, retry: false } },
  });

  return renderRouter(
    {
      appDir: "./src/app",
      overrides: {
        _layout: createTestRootLayout({
          authClient: Context.get(testRuntime.context, AuthenticationClient)
            .authClient,
          queryClient,
          runtime: testRuntime.runtime,
        }),
      },
    },
    { initialUrl },
  );
}

function createTestRootLayout({
  authClient,
  queryClient,
  runtime,
}: {
  authClient: AuthClient;
  queryClient: QueryClient;
  runtime: ApplicationRuntime;
}) {
  function TestRootLayout() {
    return (
      <RuntimeContext value={runtime}>
        <AuthClientContext value={authClient}>
          <QueryClientProvider client={queryClient}>
            <RootNavigator />
          </QueryClientProvider>
        </AuthClientContext>
      </RuntimeContext>
    );
  }

  return TestRootLayout;
}
