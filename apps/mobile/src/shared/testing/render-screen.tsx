import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderRouter } from "expo-router/testing-library";

import type { ApplicationRuntime } from "@/layer";
import type { TestRuntimeLayers } from "@/shared/testing/create-test-runtime";

import { RootNavigator } from "@/root";
import { RuntimeContext } from "@/shared/providers/runtime-context";
import { createTestRuntime } from "@/shared/testing/create-test-runtime";

type CreateTestRootLayoutOptions = {
  queryClient: QueryClient;
  runtime: ApplicationRuntime;
};

type RenderScreenOptions = {
  initialUrl: string;
  testRuntimeLayers?: TestRuntimeLayers;
};

export function renderScreen({
  initialUrl,
  testRuntimeLayers = {},
}: RenderScreenOptions) {
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
}: CreateTestRootLayoutOptions) {
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
