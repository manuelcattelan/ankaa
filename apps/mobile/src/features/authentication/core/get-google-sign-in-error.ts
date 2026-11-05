import * as Predicate from "effect/Predicate";

import { GoogleSignInInProgressError } from "#/features/authentication/errors/google-sign-in-in-progress-error.ts";

/**
 * Maps a failure of Google sign-in to the error the sign-in screen acts on,
 * or to `null` for a failure that no screen anticipates. The code comes from
 * the native module, so the Service passes it in.
 */
export function getGoogleSignInError({
  defect,
  inProgressCode,
}: {
  defect: unknown;
  inProgressCode: string;
}) {
  if (Predicate.hasProperty(defect, "code") && defect.code === inProgressCode) {
    return new GoogleSignInInProgressError();
  }

  return null;
}
