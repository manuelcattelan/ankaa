import type { SetType } from "#/shared/constants/set-types.ts";

/**
 * Counts a Workout exercise's Working sets: done counts its recorded Sets
 * whose matching planned Set is a Working set, and left is the planned
 * Working sets not done yet. A Workout exercise records no more Sets than it
 * plans, so the recorded Sets match the first `recordedSetCount` planned
 * Sets.
 */
export function getWorkingSetCounts({
  plannedSets,
  recordedSetCount,
}: {
  plannedSets: readonly { type: SetType }[];
  recordedSetCount: number;
}) {
  const doneCount = plannedSets
    .slice(0, recordedSetCount)
    .filter((plannedSet) => plannedSet.type === "working").length;
  const plannedCount = plannedSets.filter(
    (plannedSet) => plannedSet.type === "working",
  ).length;

  return { doneCount, leftCount: plannedCount - doneCount };
}
