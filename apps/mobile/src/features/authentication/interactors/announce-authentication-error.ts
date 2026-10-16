import * as Effect from "effect/Effect";

import { getAuthenticationErrorMessage } from "@/features/authentication/core/get-authentication-error-message";
import { Accessibility } from "@/shared/services/accessibility";

export const announceAuthenticationError = Effect.fn(
  "announceAuthenticationError",
)(function* (error: unknown) {
  const accessibility = yield* Accessibility;

  yield* accessibility.announceMessage(getAuthenticationErrorMessage(error));
});
