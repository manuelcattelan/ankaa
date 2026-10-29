import type { RoutineSaveInput } from "@ankaa/core/features/routine/schemas/routine-save-input-schema";

import { INTENSITY_TECHNIQUE_VALUES } from "@ankaa/core/shared/constants/intensity-techniques";

/**
 * Gives the columns that store the Intensity technique of a planned Set, the
 * reverse of `buildIntensityTechnique`.
 */
export function encodeIntensityTechnique(
  intensityTechnique: RoutineSaveInput["sections"]["main"][number]["exercises"][number]["sets"][number]["intensityTechnique"],
) {
  return {
    intensityTechnique:
      intensityTechnique === null
        ? null
        : INTENSITY_TECHNIQUE_VALUES[intensityTechnique._tag],
    pauseSeconds:
      intensityTechnique?._tag === "RestPauseSet"
        ? intensityTechnique.pauseSeconds
        : null,
    segmentCount: intensityTechnique?.segmentCount ?? null,
    weightPercentage:
      intensityTechnique?._tag === "DropSet"
        ? intensityTechnique.weightPercentage
        : null,
  };
}
