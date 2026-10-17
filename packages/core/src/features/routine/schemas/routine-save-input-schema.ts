import * as Schema from "effect/Schema";

import { VARIATIONS } from "../../../shared/constants/intensity-technique.ts";
import { SECTIONS } from "../../../shared/constants/section.ts";
import { SET_TYPES } from "../../../shared/constants/set-type.ts";
import { amountFilter } from "../../../shared/filters/amount-filter.ts";
import { createLinkedWarmUpExercisesFilter } from "../../../shared/filters/create-linked-warm-up-exercises-filter.ts";
import { createUniquePropertyValuesFilter } from "../../../shared/filters/create-unique-property-values-filter.ts";
import { createUniqueValuesFilter } from "../../../shared/filters/create-unique-values-filter.ts";
import { positionFilter } from "../../../shared/filters/position-filter.ts";
import { supersetNeighborsFilter } from "../../../shared/filters/superset-neighbors-filter.ts";
import { tempoFilter } from "../../../shared/filters/tempo-filter.ts";
import { identifierSchema } from "../../../shared/schemas/identifier-schema.ts";
import { int32Schema } from "../../../shared/schemas/int32-schema.ts";
import { DAYS_OF_WEEK } from "../constants/day-of-week.ts";
import {
  DROP_SET_WEIGHT_PERCENTAGE_MAXIMUM,
  DROP_SET_WEIGHT_PERCENTAGE_MINIMUM,
} from "../constants/drop-set.ts";
import { REST_SECONDS_MINIMUM } from "../constants/rest.ts";
import { SEGMENT_COUNT_MINIMUM } from "../constants/segment.ts";
import { routineNameFilter } from "../filters/routine-name-filter.ts";

export type RoutineSaveInput = typeof routineSaveInputSchema.Type;

const dropSetWeightPercentageFilter = Schema.isBetween({
  maximum: DROP_SET_WEIGHT_PERCENTAGE_MAXIMUM,
  minimum: DROP_SET_WEIGHT_PERCENTAGE_MINIMUM,
});

const restSecondsFilter = Schema.isGreaterThanOrEqualTo(REST_SECONDS_MINIMUM);

const segmentCountFilter = Schema.isGreaterThanOrEqualTo(SEGMENT_COUNT_MINIMUM);

const routineExerciseSetSchema = Schema.Struct({
  amount: Schema.NullOr(int32Schema.check(amountFilter)),
  dropSetSegmentCount: Schema.NullOr(int32Schema.check(segmentCountFilter)),
  dropSetWeightPercentage: Schema.NullOr(
    int32Schema.check(dropSetWeightPercentageFilter),
  ),
  id: identifierSchema,
  isToFailure: Schema.Boolean,
  position: int32Schema.check(positionFilter),
  restPauseRestSeconds: Schema.NullOr(int32Schema.check(restSecondsFilter)),
  restPauseSegmentCount: Schema.NullOr(int32Schema.check(segmentCountFilter)),
  restSeconds: Schema.NullOr(int32Schema.check(restSecondsFilter)),
  setType: Schema.Literals(SET_TYPES),
  tempo: Schema.NullOr(Schema.String.check(tempoFilter)),
  variation: Schema.NullOr(Schema.Literals(VARIATIONS)),
}).check(
  Schema.makeFilter((routineExerciseSet) => {
    const isRestPause = routineExerciseSet.variation === "rest_pause";
    const isDropSet = routineExerciseSet.variation === "drop_set";

    const restPauseIssues = (
      ["restPauseRestSeconds", "restPauseSegmentCount"] as const
    ).flatMap((restPauseKey) =>
      (typeof routineExerciseSet[restPauseKey] === "number") === isRestPause
        ? []
        : [
            {
              issue: "Must be filled exactly when the variation is rest_pause",
              path: [restPauseKey],
            },
          ],
    );

    const dropSetSegmentCountIssues =
      (typeof routineExerciseSet.dropSetSegmentCount === "number") === isDropSet
        ? []
        : [
            {
              issue: "Must be filled exactly when the variation is drop_set",
              path: ["dropSetSegmentCount"],
            },
          ];

    const dropSetWeightPercentageIssues =
      typeof routineExerciseSet.dropSetWeightPercentage === "number" &&
      !isDropSet
        ? [
            {
              issue: "Must be empty unless the variation is drop_set",
              path: ["dropSetWeightPercentage"],
            },
          ]
        : [];

    return [
      ...restPauseIssues,
      ...dropSetSegmentCountIssues,
      ...dropSetWeightPercentageIssues,
    ];
  }),
);

const routineExerciseSchema = Schema.Struct({
  exerciseId: identifierSchema,
  id: identifierSchema,
  note: Schema.NullOr(Schema.String),
  position: int32Schema.check(positionFilter),
  section: Schema.Literals(SECTIONS),
  sets: Schema.Array(routineExerciseSetSchema).check(
    createUniquePropertyValuesFilter({ propertyKey: "position" }),
  ),
  superset: Schema.NullOr(int32Schema),
  warmUpForRoutineExerciseId: Schema.NullOr(identifierSchema),
});

type RoutineExercise = typeof routineExerciseSchema.Type;

export const routineSaveInputSchema = Schema.Struct({
  days: Schema.Array(Schema.Literals(DAYS_OF_WEEK)).check(Schema.isUnique()),
  exercises: Schema.Array(routineExerciseSchema).check(
    createUniquePropertyValuesFilter({ propertyKey: "id" }),
    createUniquePropertyValuesFilter({ propertyKey: "position" }),
    createUniqueValuesFilter({
      getValues: (routineExercises: readonly RoutineExercise[]) =>
        routineExercises.flatMap((routineExercise) =>
          routineExercise.sets.map(
            (routineExerciseSet) => routineExerciseSet.id,
          ),
        ),
    }),
    createLinkedWarmUpExercisesFilter({
      warmUpForExerciseIdKey: "warmUpForRoutineExerciseId",
    }),
    supersetNeighborsFilter,
  ),
  id: identifierSchema,
  name: Schema.Trim.check(routineNameFilter),
});
