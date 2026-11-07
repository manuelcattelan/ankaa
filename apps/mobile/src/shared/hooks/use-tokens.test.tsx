import type { ReactNode } from "react";

import { renderHook, waitFor } from "@testing-library/react-native";

import type { TestRuntimeLayers } from "#/testing/create-test-runtime.ts";

import { useTokens } from "#/shared/hooks/use-tokens.ts";
import { RuntimeContext } from "#/shared/providers/runtime-context.ts";
import { TokenProvider } from "#/shared/providers/token-provider.tsx";
import { fakeAccessibilityLayer } from "#/shared/testing/fake-accessibility-layer.ts";
import { typography } from "#/shared/tokens/typography.ts";
import { createTestRuntime } from "#/testing/create-test-runtime.ts";

function renderUseTokens(testRuntimeLayers: TestRuntimeLayers) {
  const testRuntime = createTestRuntime(testRuntimeLayers);

  function Providers({ children }: { children: ReactNode }) {
    return (
      <RuntimeContext value={testRuntime.runtime}>
        <TokenProvider>{children}</TokenProvider>
      </RuntimeContext>
    );
  }

  return renderHook(useTokens, { wrapper: Providers });
}

describe("useTokens", () => {
  it("gives typography's Bold Text on Context when Bold Text is on", async () => {
    const renderHookResult = await renderUseTokens({
      accessibility: fakeAccessibilityLayer({ isBoldTextEnabled: true }),
    });

    await waitFor(() => {
      expect(renderHookResult.result.current.typography).toBe(
        typography.boldTextOn,
      );
    });
  });
});
