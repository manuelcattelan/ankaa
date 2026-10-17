import * as Effect from "effect/Effect";

import { Accessibility } from "@/shared/services/accessibility";

export const announceMessage = Effect.fn("announceMessage")(function* (
  message: string,
) {
  const accessibility = yield* Accessibility;

  yield* accessibility.announceMessage(message);
});
