import type { SetType } from "@ankaa/core/shared/constants/set-types";

import { getMatchingPlannedSet } from "@ankaa/core/features/workout/get-matching-planned-set";

/**
 * Counts a Workout exercise's Working sets: done counts its recorded Sets
 * whose matching planned Set is a Working set, and left is the planned
 * Working sets minus those done, never below 0.
 */
export function getWorkingSetCounts({
  plannedSets,
  recordedSetCount,
}: {
  plannedSets: readonly {
    intensityTechnique: unknown;
    isToFailure: boolean;
    tempo: null | string;
    type: SetType;
  }[];
  recordedSetCount: number;
}) {
  const doneCount = Array.from(
    { length: recordedSetCount },
    (value, position) => getMatchingPlannedSet({ plannedSets, position }),
  ).filter((plannedSet) => plannedSet.type === "working").length;
  const plannedCount = plannedSets.filter(
    (plannedSet) => plannedSet.type === "working",
  ).length;

  return { doneCount, leftCount: Math.max(0, plannedCount - doneCount) };
}
