import * as Effect from "effect/Effect";

import { getAuthenticationErrorMessage } from "@/features/authentication/core/get-authentication-error-message";
import { announceMessage } from "@/shared/interactors/announce-message";

export const announceAuthenticationError = Effect.fn(
  "announceAuthenticationError",
)(function* (error: unknown) {
  yield* announceMessage(getAuthenticationErrorMessage(error));
});
