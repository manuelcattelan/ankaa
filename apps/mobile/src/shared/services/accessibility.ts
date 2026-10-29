import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { AccessibilityInfo } from "react-native";

import { shouldAnnounceMessage } from "#/shared/core/should-announce-message.ts";

export class Accessibility extends Context.Service<
  Accessibility,
  { readonly announceMessage: (message: string) => Effect.Effect<void> }
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

      return Accessibility.of({ announceMessage });
    }),
  );
}
