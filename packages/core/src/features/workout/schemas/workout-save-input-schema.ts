import * as Schema from "effect/Schema";

import {
  AMOUNT_MINIMUM,
  AMOUNT_UNITS,
} from "../../../shared/constants/amount.ts";
import { VARIATIONS } from "../../../shared/constants/intensity-technique.ts";
import { POSITION_MINIMUM } from "../../../shared/constants/position.ts";
import { SECTIONS } from "../../../shared/constants/section.ts";
import { SET_TYPES } from "../../../shared/constants/set-type.ts";
import { TEMPO_PATTERN } from "../../../shared/constants/tempo.ts";
import { WEIGHT_TYPES } from "../../../shared/constants/weight-type.ts";
import { createLinkedWarmUpExercisesFilter } from "../../../shared/filters/create-linked-warm-up-exercises-filter.ts";
import { createUniqueValuesFilter } from "../../../shared/filters/create-unique-values-filter.ts";
import { supersetNeighborsFilter } from "../../../shared/filters/superset-neighbors-filter.ts";
import { identifierSchema } from "../../../shared/schemas/identifier-schema.ts";
import { int32Schema } from "../../../shared/schemas/int32-schema.ts";
import { SKIP_REASONS } from "../constants/skip-reason.ts";
import {
  WEIGHT_UNITS,
  WEIGHT_VALUE_MAXIMUM,
  WEIGHT_VALUE_MINIMUM,
  WEIGHT_VALUE_STEP,
} from "../constants/weight.ts";

export type WorkoutSaveInput = typeof workoutSaveInputSchema.Type;

const ISO_DATE_TIME_PATTERN =
  /^(?:(?:\d\d[2468][048]|\d\d[13579][26]|\d\d0[48]|[02468][048]00|[13579][26]00)-02-29|\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\d|30)|(?:02)-(?:0[1-9]|1\d|2[0-8])))T(?:(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z))$/;

const WEIGHT_VALUE_STEP_TOLERANCE_EPSILON_COUNT = 4;

const isoDateTimeSchema = Schema.String.check(
  Schema.isPattern(ISO_DATE_TIME_PATTERN),
);

const weightValueStepFilter = Schema.makeFilter(
  (weightValue: number) => {
    const weightValueStepRatio = weightValue / WEIGHT_VALUE_STEP;
    const weightValueStepTolerance =
      WEIGHT_VALUE_STEP_TOLERANCE_EPSILON_COUNT *
      Number.EPSILON *
      Math.max(Math.abs(weightValueStepRatio), 1);

    return (
      Math.abs(weightValueStepRatio - Math.round(weightValueStepRatio)) <
      weightValueStepTolerance
    );
  },
  { expected: `a value that is a multiple of ${WEIGHT_VALUE_STEP}` },
);

const workoutExerciseSetSegmentSchema = Schema.Struct({
  amount: Schema.NullOr(
    int32Schema.check(Schema.isGreaterThanOrEqualTo(AMOUNT_MINIMUM)),
  ),
  id: identifierSchema,
  position: int32Schema.check(Schema.isGreaterThanOrEqualTo(POSITION_MINIMUM)),
  weightUnit: Schema.NullOr(Schema.Literals(WEIGHT_UNITS)),
  weightValue: Schema.NullOr(
    Schema.Finite.check(
      Schema.isBetween({
        maximum: WEIGHT_VALUE_MAXIMUM,
        minimum: WEIGHT_VALUE_MINIMUM,
      }),
      weightValueStepFilter,
    ),
  ),
}).check(
  Schema.makeFilter((workoutExerciseSetSegment) =>
    typeof workoutExerciseSetSegment.weightValue === "number" &&
    typeof workoutExerciseSetSegment.weightUnit !== "string"
      ? {
          issue: "Must be filled when the weight value is filled",
          path: ["weightUnit"],
        }
      : undefined,
  ),
);

type WorkoutExerciseSetSegment = typeof workoutExerciseSetSegmentSchema.Type;

const workoutExerciseSetSchema = Schema.Struct({
  id: identifierSchema,
  isToFailure: Schema.Boolean,
  position: int32Schema.check(Schema.isGreaterThanOrEqualTo(POSITION_MINIMUM)),
  segments: Schema.Array(workoutExerciseSetSegmentSchema).check(
    Schema.isNonEmpty(),
    createUniqueValuesFilter({
      getValues: (
        workoutExerciseSetSegments: readonly WorkoutExerciseSetSegment[],
      ) =>
        workoutExerciseSetSegments.map(
          (workoutExerciseSetSegment) => workoutExerciseSetSegment.position,
        ),
    }),
  ),
  setType: Schema.Literals(SET_TYPES),
  tempo: Schema.NullOr(Schema.String.check(Schema.isPattern(TEMPO_PATTERN))),
  variation: Schema.NullOr(Schema.Literals(VARIATIONS)),
});

type WorkoutExerciseSet = typeof workoutExerciseSetSchema.Type;

const workoutExerciseSchema = Schema.Struct({
  amountUnit: Schema.Literals(AMOUNT_UNITS),
  exerciseId: identifierSchema,
  id: identifierSchema,
  note: Schema.NullOr(Schema.String),
  position: int32Schema.check(Schema.isGreaterThanOrEqualTo(POSITION_MINIMUM)),
  section: Schema.Literals(SECTIONS),
  sets: Schema.Array(workoutExerciseSetSchema).check(
    createUniqueValuesFilter({
      getValues: (workoutExerciseSets: readonly WorkoutExerciseSet[]) =>
        workoutExerciseSets.map(
          (workoutExerciseSet) => workoutExerciseSet.position,
        ),
    }),
  ),
  skipReason: Schema.NullOr(Schema.Literals(SKIP_REASONS)),
  skipReasonNote: Schema.NullOr(Schema.String),
  superset: Schema.NullOr(int32Schema),
  warmUpForWorkoutExerciseId: Schema.NullOr(identifierSchema),
  weightType: Schema.Literals(WEIGHT_TYPES),
}).check(
  Schema.makeFilter((workoutExercise) => {
    const skipReasonNoteIssues =
      typeof workoutExercise.skipReasonNote === "string" &&
      typeof workoutExercise.skipReason !== "string"
        ? [
            {
              issue: "Must be empty when the skip reason is empty",
              path: ["skipReasonNote"],
            },
          ]
        : [];

    const weightValueIssues =
      workoutExercise.weightType === "none"
        ? workoutExercise.sets.flatMap((workoutExerciseSet, setIndex) =>
            workoutExerciseSet.segments.flatMap(
              (workoutExerciseSetSegment, segmentIndex) =>
                typeof workoutExerciseSetSegment.weightValue === "number"
                  ? [
                      {
                        issue: "Must be empty when the weight type is none",
                        path: [
                          "sets",
                          setIndex,
                          "segments",
                          segmentIndex,
                          "weightValue",
                        ],
                      },
                    ]
                  : [],
            ),
          )
        : [];

    return [...skipReasonNoteIssues, ...weightValueIssues];
  }),
);

type WorkoutExercise = typeof workoutExerciseSchema.Type;

export const workoutSaveInputSchema = Schema.Struct({
  endedAt: Schema.NullOr(isoDateTimeSchema),
  exercises: Schema.Array(workoutExerciseSchema).check(
    createUniqueValuesFilter({
      getValues: (workoutExercises: readonly WorkoutExercise[]) =>
        workoutExercises.map((workoutExercise) => workoutExercise.id),
    }),
    createUniqueValuesFilter({
      getValues: (workoutExercises: readonly WorkoutExercise[]) =>
        workoutExercises.map((workoutExercise) => workoutExercise.position),
    }),
    createUniqueValuesFilter({
      getValues: (workoutExercises: readonly WorkoutExercise[]) =>
        workoutExercises.flatMap((workoutExercise) =>
          workoutExercise.sets.map(
            (workoutExerciseSet) => workoutExerciseSet.id,
          ),
        ),
    }),
    createUniqueValuesFilter({
      getValues: (workoutExercises: readonly WorkoutExercise[]) =>
        workoutExercises.flatMap((workoutExercise) =>
          workoutExercise.sets.flatMap((workoutExerciseSet) =>
            workoutExerciseSet.segments.map(
              (workoutExerciseSetSegment) => workoutExerciseSetSegment.id,
            ),
          ),
        ),
    }),
    createLinkedWarmUpExercisesFilter({
      warmUpForExerciseIdKey: "warmUpForWorkoutExerciseId",
    }),
    supersetNeighborsFilter,
  ),
  id: identifierSchema,
  routineId: identifierSchema,
  startedAt: isoDateTimeSchema,
  version: int32Schema,
}).check(
  Schema.makeFilter((workoutSaveInput) =>
    typeof workoutSaveInput.endedAt === "string" &&
    Date.parse(workoutSaveInput.endedAt) <
      Date.parse(workoutSaveInput.startedAt)
      ? { issue: "Must not be before the start", path: ["endedAt"] }
      : undefined,
  ),
);
