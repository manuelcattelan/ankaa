import { RoutineNotFoundError } from "@ankaa/core/shared/errors/routine-not-found-error";

type StartedRoutine = { deletedAt: Date | null; userId: string };

/**
 * Decides whether starting a Workout writes, given the Routine it starts
 * from, or `null` when none has its id, and the User's Workout that already
 * has the started id, or `null`. A start retried after an unknown outcome
 * writes nothing and succeeds, even when the Routine changed since. The
 * success carries the Routine, which the Workout copies.
 */
export function decideWorkoutStart<TRoutine extends StartedRoutine>({
  routine,
  userId,
  workout,
}: {
  routine: null | TRoutine;
  userId: string;
  workout: null | { id: string };
}) {
  if (workout !== null) {
    return { _tag: "WorkoutAlreadyStarted" as const };
  }

  if (routine?.userId !== userId || routine.deletedAt !== null) {
    return new RoutineNotFoundError();
  }

  return { _tag: "WorkoutStartAllowed" as const, routine };
}
