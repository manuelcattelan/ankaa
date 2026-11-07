import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Stream from "effect/Stream";

import { Accessibility } from "#/shared/services/accessibility.ts";

/**
 * Behaves like a device whose Bold Text, Increase Contrast and Reduce Motion
 * hold the values a test sets, off by default, and never change. Records each
 * message announced to the screen reader into `announcedMessages`.
 */
export function fakeAccessibilityLayer({
  announcedMessages = [],
  isBoldTextEnabled = false,
  isDarkerSystemColorsEnabled = false,
  isReduceMotionEnabled = false,
}: {
  announcedMessages?: string[];
  isBoldTextEnabled?: boolean;
  isDarkerSystemColorsEnabled?: boolean;
  isReduceMotionEnabled?: boolean;
}) {
  return Layer.succeed(
    Accessibility,
    Accessibility.of({
      announceMessage: (message: string) =>
        Effect.sync(() => {
          announcedMessages.push(message);
        }),
      boldTextChanges: Stream.never,
      darkerSystemColorsChanges: Stream.never,
      isBoldTextEnabled: () => Effect.succeed(isBoldTextEnabled),
      isDarkerSystemColorsEnabled: () =>
        Effect.succeed(isDarkerSystemColorsEnabled),
      isReduceMotionEnabled: () => Effect.succeed(isReduceMotionEnabled),
      reduceMotionChanges: Stream.never,
    }),
  );
}
