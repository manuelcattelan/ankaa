import {
  DROP_SET_WEIGHT_PERCENTAGE_MAXIMUM,
  DROP_SET_WEIGHT_PERCENTAGE_MINIMUM,
} from "@ankaa/core/features/routine/constants/drop-set";
import { REST_SECONDS_MINIMUM } from "@ankaa/core/features/routine/constants/rest";
import { SEGMENT_COUNT_MINIMUM } from "@ankaa/core/features/routine/constants/segment";
import { AMOUNT_MINIMUM } from "@ankaa/core/shared/constants/amount";
import { tempoFilter } from "@ankaa/core/shared/filters/tempo-filter";
import * as Data from "effect/Data";
import * as Match from "effect/Match";
import * as Schema from "effect/Schema";

import type { RoutineDraftExerciseSet } from "@/features/routine/core/routine-draft-reducer";
import type { WholeNumberValidationOutcome } from "@/shared/core/validate-whole-number";

import { formatTempo } from "@/features/routine/core/format-tempo";
import { isWholeNumberValid } from "@/shared/core/is-whole-number-valid";
import { validateWholeNumber } from "@/shared/core/validate-whole-number";

export type RoutineDraftExerciseSetValidationOutcome = Data.TaggedEnum<{
  RoutineDraftExerciseSetInvalid: RoutineDraftExerciseSetFieldValidationOutcomes;
  RoutineDraftExerciseSetValid: object;
}>;

type RoutineDraftExerciseSetFieldValidationOutcomes = {
  readonly amount: WholeNumberValidationOutcome;
  readonly dropSetSegmentCount: undefined | WholeNumberValidationOutcome;
  readonly dropSetWeightPercentage: undefined | WholeNumberValidationOutcome;
  readonly restPauseRestSeconds: undefined | WholeNumberValidationOutcome;
  readonly restPauseSegmentCount: undefined | WholeNumberValidationOutcome;
  readonly restSeconds: WholeNumberValidationOutcome;
  readonly tempo: TempoValidationOutcome;
};

type TempoValidationOutcome = Data.TaggedEnum<{
  TempoFormatInvalid: object;
  TempoValid: object;
}>;

const RoutineDraftExerciseSetValidationOutcome =
  Data.taggedEnum<RoutineDraftExerciseSetValidationOutcome>();

const TempoValidationOutcome = Data.taggedEnum<TempoValidationOutcome>();

export function validateRoutineDraftExerciseSet(
  routineDraftExerciseSet: RoutineDraftExerciseSet,
) {
  const isRestPause = routineDraftExerciseSet.variation === "rest_pause";
  const isDropSet = routineDraftExerciseSet.variation === "drop_set";

  const routineDraftExerciseSetFieldValidationOutcomes: RoutineDraftExerciseSetFieldValidationOutcomes =
    {
      amount: validateWholeNumber({
        isRequired: false,
        minimum: AMOUNT_MINIMUM,
        wholeNumberText: routineDraftExerciseSet.amount,
      }),
      dropSetSegmentCount: isDropSet
        ? validateWholeNumber({
            isRequired: true,
            minimum: SEGMENT_COUNT_MINIMUM,
            wholeNumberText: routineDraftExerciseSet.dropSetSegmentCount,
          })
        : undefined,
      dropSetWeightPercentage: isDropSet
        ? validateWholeNumber({
            isRequired: false,
            maximum: DROP_SET_WEIGHT_PERCENTAGE_MAXIMUM,
            minimum: DROP_SET_WEIGHT_PERCENTAGE_MINIMUM,
            wholeNumberText: routineDraftExerciseSet.dropSetWeightPercentage,
          })
        : undefined,
      restPauseRestSeconds: isRestPause
        ? validateWholeNumber({
            isRequired: true,
            minimum: REST_SECONDS_MINIMUM,
            wholeNumberText: routineDraftExerciseSet.restPauseRestSeconds,
          })
        : undefined,
      restPauseSegmentCount: isRestPause
        ? validateWholeNumber({
            isRequired: true,
            minimum: SEGMENT_COUNT_MINIMUM,
            wholeNumberText: routineDraftExerciseSet.restPauseSegmentCount,
          })
        : undefined,
      restSeconds: validateWholeNumber({
        isRequired: false,
        minimum: REST_SECONDS_MINIMUM,
        wholeNumberText: routineDraftExerciseSet.restSeconds,
      }),
      tempo: validateTempo(routineDraftExerciseSet.tempo),
    };

  const isRoutineDraftExerciseSetValid =
    [
      routineDraftExerciseSetFieldValidationOutcomes.amount,
      routineDraftExerciseSetFieldValidationOutcomes.dropSetSegmentCount,
      routineDraftExerciseSetFieldValidationOutcomes.dropSetWeightPercentage,
      routineDraftExerciseSetFieldValidationOutcomes.restPauseRestSeconds,
      routineDraftExerciseSetFieldValidationOutcomes.restPauseSegmentCount,
      routineDraftExerciseSetFieldValidationOutcomes.restSeconds,
    ].every(isWholeNumberValid) &&
    Match.valueTags(routineDraftExerciseSetFieldValidationOutcomes.tempo, {
      TempoFormatInvalid: () => false,
      TempoValid: () => true,
    });

  return isRoutineDraftExerciseSetValid
    ? RoutineDraftExerciseSetValidationOutcome.RoutineDraftExerciseSetValid()
    : RoutineDraftExerciseSetValidationOutcome.RoutineDraftExerciseSetInvalid(
        routineDraftExerciseSetFieldValidationOutcomes,
      );
}

function validateTempo(tempoText: string) {
  const tempo = formatTempo(tempoText);

  return !tempo || Schema.is(Schema.String.check(tempoFilter))(tempo)
    ? TempoValidationOutcome.TempoValid()
    : TempoValidationOutcome.TempoFormatInvalid();
}
