import type { SetType } from "#/shared/constants/set-types.ts";

/**
 * Gives a recorded Set the type, To failure, Tempo and Intensity technique
 * of its matching planned Set, the one at its `position`, or `null` when
 * it's past the last planned Set, since a Workout exercise records no more
 * Sets than it plans.
 */
export function getMatchingPlannedSet<TIntensityTechnique>({
  plannedSets,
  position,
}: {
  plannedSets: readonly {
    intensityTechnique: null | TIntensityTechnique;
    isToFailure: boolean;
    tempo: null | string;
    type: SetType;
  }[];
  position: number;
}) {
  const plannedSet = plannedSets[position];

  if (plannedSet === undefined) {
    return null;
  }

  return {
    intensityTechnique: plannedSet.intensityTechnique,
    isToFailure: plannedSet.isToFailure,
    tempo: plannedSet.tempo,
    type: plannedSet.type,
  };
}
