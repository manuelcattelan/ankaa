import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { Accessibility } from "#/shared/services/accessibility.ts";

export function fakeAccessibilityLayer(announcedMessages: string[]) {
  return Layer.succeed(
    Accessibility,
    Accessibility.of({
      announceMessage: (message: string) =>
        Effect.sync(() => {
          if (message) {
            announcedMessages.push(message);
          }
        }),
    }),
  );
}
