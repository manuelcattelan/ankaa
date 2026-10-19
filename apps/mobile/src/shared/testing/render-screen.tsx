import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderRouter } from "expo-router/testing-library";

import type { ApplicationRuntime } from "@/layer";
import type { TestRuntimeLayers } from "@/shared/testing/create-test-runtime";

import { registerMutationDefaults } from "@/defaults";
import { WorkoutDocumentsProvider } from "@/features/workout/providers/workout-documents-provider";
import { RootNavigator } from "@/shared/components/root-navigator";
import { RuntimeContext } from "@/shared/providers/runtime-context";
import { createTestRuntime } from "@/shared/testing/create-test-runtime";

type RenderScreenOptions = {
  initialUrl: string;
  testRuntimeLayers?: TestRuntimeLayers;
};

type TestRootLayoutOptions = {
  queryClient: QueryClient;
  runtime: ApplicationRuntime;
};

export function renderScreen({
  initialUrl,
  testRuntimeLayers = {},
}: RenderScreenOptions) {
  const runtime = createTestRuntime(testRuntimeLayers);

  const queryClient = new QueryClient({
    defaultOptions: { queries: { gcTime: Infinity, retry: false } },
  });

  registerMutationDefaults({ queryClient, runtime });

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

function createTestRootLayout({ queryClient, runtime }: TestRootLayoutOptions) {
  function TestRootLayout() {
    return (
      <RuntimeContext value={runtime}>
        <QueryClientProvider client={queryClient}>
          <WorkoutDocumentsProvider>
            <RootNavigator />
          </WorkoutDocumentsProvider>
        </QueryClientProvider>
      </RuntimeContext>
    );
  }

  return TestRootLayout;
}
