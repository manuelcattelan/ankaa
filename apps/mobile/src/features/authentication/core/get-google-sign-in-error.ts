import * as Predicate from "effect/Predicate";

import { GooglePlayServicesMissingError } from "#/features/authentication/errors/google-play-services-missing-error.ts";
import { GoogleSignInInProgressError } from "#/features/authentication/errors/google-sign-in-in-progress-error.ts";

type GetGoogleSignInErrorOptions = {
  defect: unknown;
  inProgressCode: string;
  playServicesNotAvailableCode: string;
};

/**
 * Maps a failure of Google sign-in to the error the sign-in screen acts on,
 * or to `null` for a failure that no screen anticipates. The codes come from
 * the native module, so the Service passes them in.
 */
export function getGoogleSignInError({
  defect,
  inProgressCode,
  playServicesNotAvailableCode,
}: GetGoogleSignInErrorOptions) {
  if (!Predicate.hasProperty(defect, "code")) {
    return null;
  }

  if (defect.code === playServicesNotAvailableCode) {
    return new GooglePlayServicesMissingError();
  }

  if (defect.code === inProgressCode) {
    return new GoogleSignInInProgressError();
  }

  return null;
}
