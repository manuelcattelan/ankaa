import type { ReactNode } from "react";

import type { TestRuntimeLayers } from "#/testing/create-test-runtime.ts";

import { RuntimeContext } from "#/shared/providers/runtime-context.ts";
import { TokenProvider } from "#/shared/providers/token-provider.tsx";
import { createTestRuntime } from "#/testing/create-test-runtime.ts";

/**
 * Builds the providers that a design system component or hook reads its live
 * flags through, over a test Runtime built from the given Fakes, as the
 * `wrapper` of `render` or `renderHook`, for a component or hook that no
 * screen uses yet.
 */
export function createTokenProviders(testRuntimeLayers: TestRuntimeLayers) {
  const testRuntime = createTestRuntime(testRuntimeLayers);

  function TokenProviders({ children }: { children: ReactNode }) {
    return (
      <RuntimeContext value={testRuntime.runtime}>
        <TokenProvider>{children}</TokenProvider>
      </RuntimeContext>
    );
  }

  return TokenProviders;
}
