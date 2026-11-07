import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Queue from "effect/Queue";
import * as Stream from "effect/Stream";
import { AccessibilityInfo } from "react-native";

import { isAccessibilitySettingEnabled } from "#/shared/core/is-accessibility-setting-enabled.ts";
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

function readSetting(isSettingEnabled: () => Promise<boolean>) {
  return Effect.tryPromise(isSettingEnabled).pipe(
    Effect.result,
    Effect.map((read) => isAccessibilitySettingEnabled({ read })),
  );
}

// Removes the listener when the stream ends, as Effect's own
// Stream.fromEventListener does
// (https://github.com/Effect-TS/effect/blob/7f524e25cfb49a71ac39b0f44278d08d40dda5de/packages/effect/src/Stream.ts#L1466-L1487).
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
