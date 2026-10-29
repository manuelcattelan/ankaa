import * as Effect from "effect/Effect";

import { getAuthenticationErrorMessage } from "#/features/authentication/core/get-authentication-error-message.ts";
import { announceMessage } from "#/shared/interactors/announce-message.ts";

export const announceAuthenticationError = Effect.fn(
  "announceAuthenticationError",
)(function* (error: unknown) {
  yield* announceMessage(getAuthenticationErrorMessage(error));
});
