import { RoutineNotFoundError } from "@ankaa/core/shared/errors/routine-not-found-error";

/**
 * Decides whether deleting a Routine writes, given the Routine with the
 * deleted id, or `null` when none has it. Deleting a Routine the User already
 * deleted writes nothing and succeeds, so a delete retried after an unknown
 * outcome ends where the User meant.
 */
export function decideRoutineDelete({
  routine,
  userId,
}: {
  routine: null | { deletedAt: Date | null; userId: string };
  userId: string;
}) {
  if (routine?.userId !== userId) {
    return new RoutineNotFoundError();
  }

  if (routine.deletedAt !== null) {
    return { _tag: "RoutineAlreadyDeleted" as const };
  }

  return { _tag: "RoutineDeleteAllowed" as const };
}
