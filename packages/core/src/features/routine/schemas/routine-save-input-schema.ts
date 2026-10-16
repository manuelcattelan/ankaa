import * as Schema from "effect/Schema";

import { VARIATIONS } from "../../../shared/constants/intensity-technique.ts";
import { POSITION_MINIMUM } from "../../../shared/constants/position.ts";
import { SECTIONS } from "../../../shared/constants/section.ts";
import { SET_TYPES } from "../../../shared/constants/set-type.ts";
import { amountFilter } from "../../../shared/filters/amount-filter.ts";
import { createLinkedWarmUpExercisesFilter } from "../../../shared/filters/create-linked-warm-up-exercises-filter.ts";
import { createUniqueValuesFilter } from "../../../shared/filters/create-unique-values-filter.ts";
import { supersetNeighborsFilter } from "../../../shared/filters/superset-neighbors-filter.ts";
import { tempoFilter } from "../../../shared/filters/tempo-filter.ts";
import { identifierSchema } from "../../../shared/schemas/identifier-schema.ts";
import { int32Schema } from "../../../shared/schemas/int32-schema.ts";
import { DAYS_OF_WEEK } from "../constants/day-of-week.ts";
import { dropSetWeightPercentageFilter } from "../filters/drop-set-weight-percentage-filter.ts";
import { restSecondsFilter } from "../filters/rest-seconds-filter.ts";
import { routineNameFilter } from "../filters/routine-name-filter.ts";
import { segmentCountFilter } from "../filters/segment-count-filter.ts";

export type RoutineSaveInput = typeof routineSaveInputSchema.Type;

const routineExerciseSetSchema = Schema.Struct({
  amount: Schema.NullOr(int32Schema.check(amountFilter)),
  dropSetSegmentCount: Schema.NullOr(int32Schema.check(segmentCountFilter)),
  dropSetWeightPercentage: Schema.NullOr(
    int32Schema.check(dropSetWeightPercentageFilter),
  ),
  id: identifierSchema,
  isToFailure: Schema.Boolean,
  position: int32Schema.check(Schema.isGreaterThanOrEqualTo(POSITION_MINIMUM)),
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
  name: Schema.Trim.check(routineNameFilter),
});
