import { WorkoutNotFoundError } from "@ankaa/core/features/workout/errors/workout-not-found-error";
import { RoutineNotFoundError } from "@ankaa/core/shared/errors/routine-not-found-error";

type StartedRoutine = { deletedAt: Date | null; userId: string };

/**
 * Decides whether starting a Workout writes, given the Routine it starts
 * from, or `null` when none has its id, and the Workout that already has the
 * started id, or `null`. A start retried after an unknown outcome writes
 * nothing and succeeds, even when the Routine changed since, while the id of
 * another User's Workout fails as `workout.saveSet` fails for the id of a Set
 * elsewhere. The success carries the Routine, which the Workout copies.
 */
export function decideWorkoutStart<TRoutine extends StartedRoutine>({
  routine,
  userId,
  workout,
}: {
  routine: null | TRoutine;
  userId: string;
  workout: null | { userId: string };
}) {
  if (workout !== null) {
    return workout.userId === userId
      ? { _tag: "WorkoutAlreadyStarted" as const }
      : new WorkoutNotFoundError();
  }

  if (routine?.userId !== userId || routine.deletedAt !== null) {
    return new RoutineNotFoundError();
  }

  return { _tag: "WorkoutStartAllowed" as const, routine };
}
