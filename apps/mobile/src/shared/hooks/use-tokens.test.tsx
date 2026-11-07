import { renderHook, waitFor } from "@testing-library/react-native";

import { useTokens } from "#/shared/hooks/use-tokens.ts";
import { fakeAccessibilityLayer } from "#/shared/testing/fake-accessibility-layer.ts";
import { iconography } from "#/shared/tokens/iconography.ts";
import { motion } from "#/shared/tokens/motion.ts";
import { typography } from "#/shared/tokens/typography.ts";
import { createTokenProviders } from "#/testing/create-token-providers.tsx";

describe("useTokens", () => {
  it("gives typography's Bold Text on Context when Bold Text is on", async () => {
    const renderHookResult = await renderHook(useTokens, {
      wrapper: createTokenProviders({
        accessibility: fakeAccessibilityLayer({ isBoldTextEnabled: true }),
      }),
    });

    await waitFor(() => {
      expect(renderHookResult.result.current.typography).toBe(
        typography.boldTextOn,
      );
    });
  });

  it("gives motion's Reduce Motion on Context when Reduce Motion is on", async () => {
    const renderHookResult = await renderHook(useTokens, {
      wrapper: createTokenProviders({
        accessibility: fakeAccessibilityLayer({ isReduceMotionEnabled: true }),
      }),
    });

    await waitFor(() => {
      expect(renderHookResult.result.current.motion).toBe(
        motion.reduceMotionOn,
      );
    });
  });

  it("gives iconography's Bold Text on Context when Bold Text is on", async () => {
    const renderHookResult = await renderHook(useTokens, {
      wrapper: createTokenProviders({
        accessibility: fakeAccessibilityLayer({ isBoldTextEnabled: true }),
      }),
    });

    await waitFor(() => {
      expect(renderHookResult.result.current.iconography).toBe(
        iconography.boldTextOn,
      );
    });
  });
});
