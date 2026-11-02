import { AbsenceNotFoundError } from "@ankaa/core/features/absence/errors/absence-not-found-error";

/**
 * Decides whether removing an Absence writes, given the Absence with the
 * removed id, or `null` when none has it. Removing an Absence that's already
 * gone writes nothing and succeeds, so a removal retried after a lost
 * response ends where the User meant, as removing a recorded Set does.
 */
export function decideAbsenceRemove({
  absence,
  userId,
}: {
  absence: null | { userId: string };
  userId: string;
}) {
  if (absence === null) {
    return { _tag: "AbsenceAlreadyRemoved" as const };
  }

  if (absence.userId !== userId) {
    return new AbsenceNotFoundError();
  }

  return { _tag: "AbsenceRemoveAllowed" as const };
}
