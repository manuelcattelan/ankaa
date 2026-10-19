import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { AccessibilityInfo, Platform } from "react-native";

export class Accessibility extends Context.Service<Accessibility>()(
  "@ankaa/mobile/shared/services/Accessibility",
  {
    make: Effect.sync(() => {
      function announceMessage(message: string) {
        return Effect.sync(() => {
          if (!message || Platform.OS !== "ios") {
            return;
          }

          AccessibilityInfo.announceForAccessibilityWithOptions(message, {
            queue: true,
          });
        });
      }

      return { announceMessage };
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make);

  static readonly layerTest = (announcedMessages: string[]) =>
    Layer.succeed(
      this,
      this.of({
        announceMessage: (message: string) =>
          Effect.sync(() => {
            if (message) {
              announcedMessages.push(message);
            }
          }),
      }),
    );
}
