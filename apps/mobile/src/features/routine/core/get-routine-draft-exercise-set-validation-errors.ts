import {
  DROP_SET_WEIGHT_PERCENTAGE_MAXIMUM,
  DROP_SET_WEIGHT_PERCENTAGE_MINIMUM,
} from "@ankaa/core/features/routine/constants/drop-set";
import { REST_SECONDS_MINIMUM } from "@ankaa/core/features/routine/constants/rest";
import { SEGMENT_COUNT_MINIMUM } from "@ankaa/core/features/routine/constants/segment";
import { dropSetWeightPercentageFilter } from "@ankaa/core/features/routine/filters/drop-set-weight-percentage-filter";
import { restSecondsFilter } from "@ankaa/core/features/routine/filters/rest-seconds-filter";
import { segmentCountFilter } from "@ankaa/core/features/routine/filters/segment-count-filter";
import { AMOUNT_MINIMUM } from "@ankaa/core/shared/constants/amount";
import { amountFilter } from "@ankaa/core/shared/filters/amount-filter";
import { tempoFilter } from "@ankaa/core/shared/filters/tempo-filter";
import * as Schema from "effect/Schema";

import type { RoutineDraftExerciseSet } from "@/features/routine/core/routine-draft-reducer";

import { formatTempo } from "@/features/routine/core/format-tempo";
import { routineEditorMessages } from "@/features/routine/messages/routine-editor-messages";
import { getWholeNumberValidationError } from "@/shared/core/get-whole-number-validation-error";

export function getRoutineDraftExerciseSetValidationErrors(
  routineDraftExerciseSet: RoutineDraftExerciseSet,
) {
  const isRestPause = routineDraftExerciseSet.variation === "rest_pause";
  const isDropSet = routineDraftExerciseSet.variation === "drop_set";

  return {
    amount: getWholeNumberValidationError({
      isRequired: false,
      minimum: AMOUNT_MINIMUM,
      wholeNumberFilter: amountFilter,
      wholeNumberText: routineDraftExerciseSet.amount,
    }),
    dropSetSegmentCount: isDropSet
      ? getWholeNumberValidationError({
          isRequired: true,
          minimum: SEGMENT_COUNT_MINIMUM,
          wholeNumberFilter: segmentCountFilter,
          wholeNumberText: routineDraftExerciseSet.dropSetSegmentCount,
        })
      : undefined,
    dropSetWeightPercentage: isDropSet
      ? getWholeNumberValidationError({
          isRequired: false,
          maximum: DROP_SET_WEIGHT_PERCENTAGE_MAXIMUM,
          minimum: DROP_SET_WEIGHT_PERCENTAGE_MINIMUM,
          wholeNumberFilter: dropSetWeightPercentageFilter,
          wholeNumberText: routineDraftExerciseSet.dropSetWeightPercentage,
        })
      : undefined,
    restPauseRestSeconds: isRestPause
      ? getWholeNumberValidationError({
          isRequired: true,
          minimum: REST_SECONDS_MINIMUM,
          wholeNumberFilter: restSecondsFilter,
          wholeNumberText: routineDraftExerciseSet.restPauseRestSeconds,
        })
      : undefined,
    restPauseSegmentCount: isRestPause
      ? getWholeNumberValidationError({
          isRequired: true,
          minimum: SEGMENT_COUNT_MINIMUM,
          wholeNumberFilter: segmentCountFilter,
          wholeNumberText: routineDraftExerciseSet.restPauseSegmentCount,
        })
      : undefined,
    restSeconds: getWholeNumberValidationError({
      isRequired: false,
      minimum: REST_SECONDS_MINIMUM,
      wholeNumberFilter: restSecondsFilter,
      wholeNumberText: routineDraftExerciseSet.restSeconds,
    }),
    tempo: getTempoValidationError(routineDraftExerciseSet.tempo),
  };
}

function getTempoValidationError(tempoText: string) {
  const tempo = formatTempo(tempoText);

  if (!tempo || Schema.is(Schema.String.check(tempoFilter))(tempo)) {
    return undefined;
  }

  return routineEditorMessages.tempoFormatError;
}
