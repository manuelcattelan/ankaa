import { WorkoutNotFoundError } from "@ankaa/core/features/workout/errors/workout-not-found-error";

/**
 * Decides whether stopping a Workout writes, given the Workout with the
 * stopped id, or `null` when none has it. Stopping a Workout the User already
 * stopped writes nothing and succeeds, so a stop retried after an unknown
 * outcome ends where the User meant.
 */
export function decideWorkoutStop({
  userId,
  workout,
}: {
  userId: string;
  workout: null | { endedAt: Date | null; userId: string };
}) {
  if (workout?.userId !== userId) {
    return new WorkoutNotFoundError();
  }

  if (workout.endedAt !== null) {
    return { _tag: "WorkoutAlreadyStopped" as const };
  }

  return { _tag: "WorkoutStopAllowed" as const };
}
