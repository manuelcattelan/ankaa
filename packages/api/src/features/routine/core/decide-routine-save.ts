import { RoutineNotFoundError } from "@ankaa/core/shared/errors/routine-not-found-error";

/**
 * Decides whether a Save may write the Routine, given the Routine with the
 * Saved id, or `null` when none has it yet. A Save creates the Routine or
 * updates the User's live one, and never revives a Routine the User deleted.
 */
export function decideRoutineSave({
  routine,
  userId,
}: {
  routine: null | { deletedAt: Date | null; userId: string };
  userId: string;
}) {
  if (routine === null) {
    return { _tag: "RoutineSaveAllowed" as const };
  }

  if (routine.userId !== userId || routine.deletedAt !== null) {
    return new RoutineNotFoundError();
  }

  return { _tag: "RoutineSaveAllowed" as const };
}
