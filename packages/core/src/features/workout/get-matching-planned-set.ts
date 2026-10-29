import type { SetType } from "#/shared/constants/set-types.ts";

/**
 * Gives a recorded Set the type, To failure, Tempo and Intensity technique
 * of its matching planned Set: the one at its `position`, the last one when
 * it's past the end of the plan, or a plain Working set when nothing was
 * planned.
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
  const plannedSet =
    plannedSets[position] ?? plannedSets[plannedSets.length - 1];

  if (plannedSet === undefined) {
    return {
      intensityTechnique: null,
      isToFailure: false,
      tempo: null,
      type: "working" as const,
    };
  }

  return {
    intensityTechnique: plannedSet.intensityTechnique,
    isToFailure: plannedSet.isToFailure,
    tempo: plannedSet.tempo,
    type: plannedSet.type,
  };
}
