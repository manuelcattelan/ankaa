import type { ReactNode } from "react";

import * as Effect from "effect/Effect";
import * as Fiber from "effect/Fiber";
import * as Stream from "effect/Stream";
import { useEffect, useState } from "react";

import type { AccessibilityFlags } from "#/shared/providers/accessibility-flags-context.ts";

import { useRuntime } from "#/shared/hooks/use-runtime.ts";
import { AccessibilityFlagsContext } from "#/shared/providers/accessibility-flags-context.ts";
import { Accessibility } from "#/shared/services/accessibility.ts";

// Subscribes to each change stream before the first reads, as React Native's
// AccessibilityInfo example adds its listeners before it reads
// (https://reactnative.dev/docs/accessibilityinfo), so no change is lost
// between a read and its subscription. Stream.toPull starts each stream's
// listener before it returns.
const program = Effect.fn("watchAccessibilityFlags")(function* (
  onChange: (accessibilityFlags: AccessibilityFlags) => void,
) {
  const accessibility = yield* Accessibility;

  const boldTextChanges = yield* Stream.toPull(accessibility.boldTextChanges);
  const darkerSystemColorsChanges = yield* Stream.toPull(
    accessibility.darkerSystemColorsChanges,
  );
  const reduceMotionChanges = yield* Stream.toPull(
    accessibility.reduceMotionChanges,
  );

  const [
    isBoldTextEnabled,
    isDarkerSystemColorsEnabled,
    isReduceMotionEnabled,
  ] = yield* Effect.all(
    [
      accessibility.isBoldTextEnabled(),
      accessibility.isDarkerSystemColorsEnabled(),
      accessibility.isReduceMotionEnabled(),
    ],
    { concurrency: "unbounded" },
  );

  yield* Stream.zipLatestAll(
    Stream.fromPull(Effect.succeed(boldTextChanges)).pipe(
      Stream.prepend([isBoldTextEnabled]),
    ),
    Stream.fromPull(Effect.succeed(darkerSystemColorsChanges)).pipe(
      Stream.prepend([isDarkerSystemColorsEnabled]),
    ),
    Stream.fromPull(Effect.succeed(reduceMotionChanges)).pipe(
      Stream.prepend([isReduceMotionEnabled]),
    ),
  ).pipe(
    Stream.runForEach(([isBoldText, isDarkerSystemColors, isReduceMotion]) =>
      Effect.sync(() => {
        onChange({
          isBoldTextEnabled: isBoldText,
          isDarkerSystemColorsEnabled: isDarkerSystemColors,
          isReduceMotionEnabled: isReduceMotion,
        });
      }),
    ),
  );
}, Effect.scoped);

/**
 * Keeps Bold Text, Increase Contrast and Reduce Motion live for
 * `useTokens()`, `useColorVariant()` and the splash screen, from the
 * `Accessibility` Service, while it's mounted.
 */
export function TokenProvider({ children }: { children: ReactNode }) {
  const runtime = useRuntime();

  const [accessibilityFlags, setAccessibilityFlags] =
    useState<AccessibilityFlags | null>(null);

  useEffect(() => {
    const fiber = runtime.runFork(program(setAccessibilityFlags));

    return () => {
      runtime.runFork(Fiber.interrupt(fiber));
    };
  }, [runtime]);

  return (
    <AccessibilityFlagsContext value={accessibilityFlags}>
      {children}
    </AccessibilityFlagsContext>
  );
}
