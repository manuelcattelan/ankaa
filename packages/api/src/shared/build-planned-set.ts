import type { IntensityTechnique } from "@ankaa/core/shared/constants/intensity-techniques";
import type { SetType } from "@ankaa/core/shared/constants/set-types";

import {
  DROP_SET,
  REST_PAUSE_SET,
} from "@ankaa/core/shared/constants/intensity-techniques";

/**
 * Builds the planned Set that a procedure returns from the columns that
 * store it.
 */
export function buildPlannedSet(plannedSet: {
  amount: null | number;
  id: string;
  intensityTechnique: IntensityTechnique | null;
  isToFailure: boolean;
  pauseSeconds: null | number;
  restSeconds: null | number;
  segmentCount: null | number;
  tempo: null | string;
  type: SetType;
  weightPercentage: null | number;
}) {
  return {
    amount: plannedSet.amount,
    id: plannedSet.id,
    intensityTechnique: buildIntensityTechnique(plannedSet),
    isToFailure: plannedSet.isToFailure,
    restSeconds: plannedSet.restSeconds,
    tempo: plannedSet.tempo,
    type: plannedSet.type,
  };
}

/**
 * Builds the Intensity technique of a planned Set from the columns that
 * store it, or `null` for a Set without one.
 */
function buildIntensityTechnique(set: {
  intensityTechnique: IntensityTechnique | null;
  pauseSeconds: null | number;
  segmentCount: null | number;
  weightPercentage: null | number;
}) {
  if (set.intensityTechnique === DROP_SET && set.segmentCount !== null) {
    return {
      _tag: "DropSet" as const,
      segmentCount: set.segmentCount,
      weightPercentage: set.weightPercentage,
    };
  }

  if (
    set.intensityTechnique === REST_PAUSE_SET &&
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
