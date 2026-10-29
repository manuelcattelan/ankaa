import * as Predicate from "effect/Predicate";

import { REQUEST_CANCELED_ERROR_CODE } from "#/features/authentication/constants/request-canceled-error-code.ts";
import { AppleSignInCanceledError } from "#/features/authentication/errors/apple-sign-in-canceled-error.ts";

/**
 * Maps a failure of Apple sign-in to the error the sign-in screen acts on, or
 * to `null` for a failure that no screen anticipates.
 */
export function getAppleSignInError(defect: unknown) {
  if (
    Predicate.hasProperty(defect, "code") &&
    defect.code === REQUEST_CANCELED_ERROR_CODE
  ) {
    return new AppleSignInCanceledError();
  }

  return null;
}
