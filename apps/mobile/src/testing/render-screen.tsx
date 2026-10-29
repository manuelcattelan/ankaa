import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderRouter } from "expo-router/testing-library";

import type { ApplicationRuntime } from "#/layer.ts";
import type { TestRuntimeLayers } from "#/testing/create-test-runtime.ts";

import { RootNavigator } from "#/root-navigator.tsx";
import { RuntimeContext } from "#/shared/providers/runtime-context.ts";
import { createTestRuntime } from "#/testing/create-test-runtime.ts";

export function renderScreen({
  initialUrl,
  testRuntimeLayers = {},
}: {
  initialUrl: string;
  testRuntimeLayers?: TestRuntimeLayers;
}) {
  const runtime = createTestRuntime(testRuntimeLayers);

  const queryClient = new QueryClient({
    defaultOptions: { queries: { gcTime: Infinity, retry: false } },
  });

  return renderRouter(
    {
      appDir: "./src/app",
      overrides: {
        _layout: createTestRootLayout({ queryClient, runtime }),
      },
    },
    { initialUrl },
  );
}

function createTestRootLayout({
  queryClient,
  runtime,
}: {
  queryClient: QueryClient;
  runtime: ApplicationRuntime;
}) {
  function TestRootLayout() {
    return (
      <RuntimeContext value={runtime}>
        <QueryClientProvider client={queryClient}>
          <RootNavigator />
        </QueryClientProvider>
      </RuntimeContext>
    );
  }

  return TestRootLayout;
}
