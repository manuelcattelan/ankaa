import type { ReactNode } from "react";

import * as Effect from "effect/Effect";
import * as Fiber from "effect/Fiber";
import * as Stream from "effect/Stream";
import { useEffect, useState } from "react";

import type { AccessibilityFlags } from "#/shared/providers/accessibility-flags-context.ts";

import { useRuntime } from "#/shared/hooks/use-runtime.ts";
import { AccessibilityFlagsContext } from "#/shared/providers/accessibility-flags-context.ts";
import { Accessibility } from "#/shared/services/accessibility.ts";

// Subscribes to the flag's change stream before its first read, as React
// Native's AccessibilityInfo example adds its listeners before it reads
// (https://reactnative.dev/docs/accessibilityinfo), so no change is lost
// between the read and the subscription. Stream.toPull starts the stream's
// listener before it returns.
function watchAccessibilityFlag({
  changes,
  read,
}: {
  changes: Stream.Stream<boolean>;
  read: Effect.Effect<boolean>;
}) {
  return Effect.gen(function* () {
    const pull = yield* Stream.toPull(changes);
    const isEnabled = yield* read;

    return Stream.fromPull(Effect.succeed(pull)).pipe(
      Stream.prepend([isEnabled]),
    );
  });
}

const program = Effect.fn("accessibilityFlagsWatch")(function* (
  onChange: (accessibilityFlags: AccessibilityFlags) => void,
) {
  const accessibility = yield* Accessibility;

  const flagStreams = yield* Effect.all(
    [
      watchAccessibilityFlag({
        changes: accessibility.boldTextChanges,
        read: accessibility.isBoldTextEnabled(),
      }),
      watchAccessibilityFlag({
        changes: accessibility.darkerSystemColorsChanges,
        read: accessibility.isDarkerSystemColorsEnabled(),
      }),
      watchAccessibilityFlag({
        changes: accessibility.reduceMotionChanges,
        read: accessibility.isReduceMotionEnabled(),
      }),
    ],
    { concurrency: "unbounded" },
  );

  yield* Stream.zipLatestAll(...flagStreams).pipe(
    Stream.runForEach(
      ([
        isBoldTextEnabled,
        isDarkerSystemColorsEnabled,
        isReduceMotionEnabled,
      ]) =>
        Effect.sync(() => {
          onChange({
            isBoldTextEnabled,
            isDarkerSystemColorsEnabled,
            isReduceMotionEnabled,
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
