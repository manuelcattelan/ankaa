import type { SetType } from "#/shared/constants/set-types.ts";
import type { SkipReason } from "#/shared/constants/skip-reasons.ts";

import { getWorkingSetCounts } from "#/features/workout/core/get-working-set-counts.ts";

/**
 * Tells whether a stop of its Workout leaves a Workout exercise as it is: it
 * has a Skip, or no planned Working set is left to record. A stop Skips
 * every other Workout exercise.
 */
export function isWorkoutExerciseDone({
  plannedSets,
  recordedSetCount,
  skipReason,
}: {
  plannedSets: readonly { type: SetType }[];
  recordedSetCount: number;
  skipReason: null | SkipReason;
}) {
  return (
    skipReason !== null ||
    getWorkingSetCounts({ plannedSets, recordedSetCount }).leftCount === 0
  );
}
