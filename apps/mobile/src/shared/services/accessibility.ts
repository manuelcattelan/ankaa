import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Queue from "effect/Queue";
import * as Stream from "effect/Stream";
import { AccessibilityInfo } from "react-native";

import { shouldAnnounceMessage } from "#/shared/core/should-announce-message.ts";

export class Accessibility extends Context.Service<
  Accessibility,
  {
    readonly announceMessage: (message: string) => Effect.Effect<void>;
    readonly boldTextChanges: Stream.Stream<boolean>;
    readonly darkerSystemColorsChanges: Stream.Stream<boolean>;
    readonly isBoldTextEnabled: () => Effect.Effect<boolean>;
    readonly isDarkerSystemColorsEnabled: () => Effect.Effect<boolean>;
    readonly isReduceMotionEnabled: () => Effect.Effect<boolean>;
    readonly reduceMotionChanges: Stream.Stream<boolean>;
  }
>()("@ankaa/mobile/shared/services/Accessibility") {
  static readonly layer = Layer.effect(
    Accessibility,
    Effect.sync(() => {
      function announceMessage(message: string) {
        return Effect.sync(() => {
          if (!shouldAnnounceMessage({ message })) {
            return;
          }

          AccessibilityInfo.announceForAccessibilityWithOptions(message, {
            queue: true,
          });
        });
      }

      return Accessibility.of({
        announceMessage,
        boldTextChanges: createChangeStream("boldTextChanged"),
        darkerSystemColorsChanges: createChangeStream(
          "darkerSystemColorsChanged",
        ),
        isBoldTextEnabled: () =>
          readSetting(() => AccessibilityInfo.isBoldTextEnabled()),
        isDarkerSystemColorsEnabled: () =>
          readSetting(() => AccessibilityInfo.isDarkerSystemColorsEnabled()),
        isReduceMotionEnabled: () =>
          readSetting(() => AccessibilityInfo.isReduceMotionEnabled()),
        reduceMotionChanges: createChangeStream("reduceMotionChanged"),
      });
    }),
  );
}

// AccessibilityInfo rejects a read when its native module is missing, and the
// setting then counts as off.
function readSetting(isSettingEnabled: () => Promise<boolean>) {
  return Effect.tryPromise(isSettingEnabled).pipe(
    Effect.orElseSucceed(() => false),
  );
}

// Removes the listener when the stream ends, as Effect's own
// Stream.fromEventListener does.
function createChangeStream(
  eventName:
    "boldTextChanged" | "darkerSystemColorsChanged" | "reduceMotionChanged",
) {
  return Stream.callback<boolean>((queue) =>
    Effect.acquireRelease(
      Effect.sync(() =>
        AccessibilityInfo.addEventListener(eventName, (isEnabled: boolean) => {
          Queue.offerUnsafe(queue, isEnabled);
        }),
      ),
      (subscription) =>
        Effect.sync(() => {
          subscription.remove();
        }),
    ),
  );
}
