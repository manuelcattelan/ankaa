import type { IntensityTechnique } from "@ankaa/core/shared/constants/intensity-techniques";

/**
 * Builds the Intensity technique of a planned Set from the columns that
 * store it, or `null` for a Set without one.
 */
export function buildIntensityTechnique(set: {
  intensityTechnique: IntensityTechnique | null;
  pauseSeconds: null | number;
  segmentCount: null | number;
  weightPercentage: null | number;
}) {
  if (set.intensityTechnique === "drop_set" && set.segmentCount !== null) {
    return {
      _tag: "DropSet" as const,
      segmentCount: set.segmentCount,
      weightPercentage: set.weightPercentage,
    };
  }

  if (
    set.intensityTechnique === "rest_pause_set" &&
    set.segmentCount !== null &&
    set.pauseSeconds !== null
  ) {
    return {
      _tag: "RestPauseSet" as const,
      pauseSeconds: set.pauseSeconds,
      segmentCount: set.segmentCount,
    };
  }

  return null;
}
