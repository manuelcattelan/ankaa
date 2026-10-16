import * as Schema from "effect/Schema";

import { AMOUNT_MINIMUM } from "../../../shared/constants/amount.ts";
import { VARIATIONS } from "../../../shared/constants/intensity-technique.ts";
import { POSITION_MINIMUM } from "../../../shared/constants/position.ts";
import { SECTIONS } from "../../../shared/constants/section.ts";
import { SET_TYPES } from "../../../shared/constants/set-type.ts";
import { TEMPO_PATTERN } from "../../../shared/constants/tempo.ts";
import { createLinkedWarmUpExercisesFilter } from "../../../shared/filters/create-linked-warm-up-exercises-filter.ts";
import { createUniqueValuesFilter } from "../../../shared/filters/create-unique-values-filter.ts";
import { supersetNeighborsFilter } from "../../../shared/filters/superset-neighbors-filter.ts";
import { identifierSchema } from "../../../shared/schemas/identifier-schema.ts";
import { DAYS_OF_WEEK } from "../constants/day-of-week.ts";
import {
  DROP_SET_WEIGHT_PERCENTAGE_MAXIMUM,
  DROP_SET_WEIGHT_PERCENTAGE_MINIMUM,
} from "../constants/drop-set.ts";
import { REST_SECONDS_MINIMUM } from "../constants/rest.ts";
import { SEGMENT_COUNT_MINIMUM } from "../constants/segment.ts";

export type RoutineSaveInput = typeof routineSaveInputSchema.Type;

const int32Schema = Schema.Number.check(Schema.isInt32());

const routineExerciseSetSchema = Schema.Struct({
  amount: Schema.NullOr(
    int32Schema.check(Schema.isGreaterThanOrEqualTo(AMOUNT_MINIMUM)),
  ),
  dropSetSegmentCount: Schema.NullOr(
    int32Schema.check(Schema.isGreaterThanOrEqualTo(SEGMENT_COUNT_MINIMUM)),
  ),
  dropSetWeightPercentage: Schema.NullOr(
    int32Schema.check(
      Schema.isBetween({
        maximum: DROP_SET_WEIGHT_PERCENTAGE_MAXIMUM,
        minimum: DROP_SET_WEIGHT_PERCENTAGE_MINIMUM,
      }),
    ),
  ),
  id: identifierSchema,
  isToFailure: Schema.Boolean,
  position: int32Schema.check(Schema.isGreaterThanOrEqualTo(POSITION_MINIMUM)),
  restPauseRestSeconds: Schema.NullOr(
    int32Schema.check(Schema.isGreaterThanOrEqualTo(REST_SECONDS_MINIMUM)),
  ),
  restPauseSegmentCount: Schema.NullOr(
    int32Schema.check(Schema.isGreaterThanOrEqualTo(SEGMENT_COUNT_MINIMUM)),
  ),
  restSeconds: Schema.NullOr(
    int32Schema.check(Schema.isGreaterThanOrEqualTo(REST_SECONDS_MINIMUM)),
  ),
  setType: Schema.Literals(SET_TYPES),
  tempo: Schema.NullOr(Schema.String.check(Schema.isPattern(TEMPO_PATTERN))),
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
  position: int32Schema.check(Schema.isGreaterThanOrEqualTo(POSITION_MINIMUM)),
  section: Schema.Literals(SECTIONS),
  sets: Schema.Array(routineExerciseSetSchema).check(
    createUniqueValuesFilter({
      getValues: (routineExerciseSets: readonly RoutineExerciseSet[]) =>
        routineExerciseSets.map(
          (routineExerciseSet) => routineExerciseSet.position,
        ),
    }),
  ),
  superset: Schema.NullOr(int32Schema),
  warmUpForRoutineExerciseId: Schema.NullOr(identifierSchema),
});

type RoutineExercise = typeof routineExerciseSchema.Type;

type RoutineExerciseSet = typeof routineExerciseSetSchema.Type;

export const routineSaveInputSchema = Schema.Struct({
  days: Schema.Array(Schema.Literals(DAYS_OF_WEEK)).check(Schema.isUnique()),
  exercises: Schema.Array(routineExerciseSchema).check(
    createUniqueValuesFilter({
      getValues: (routineExercises: readonly RoutineExercise[]) =>
        routineExercises.map((routineExercise) => routineExercise.id),
    }),
    createUniqueValuesFilter({
      getValues: (routineExercises: readonly RoutineExercise[]) =>
        routineExercises.map((routineExercise) => routineExercise.position),
    }),
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
  name: Schema.Trim.check(Schema.isNonEmpty()),
});
