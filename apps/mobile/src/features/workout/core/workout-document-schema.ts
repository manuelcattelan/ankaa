import { SKIP_REASONS } from "@ankaa/core/features/workout/constants/skip-reason";
import { WEIGHT_UNITS } from "@ankaa/core/features/workout/constants/weight";
import { AMOUNT_UNITS } from "@ankaa/core/shared/constants/amount";
import { VARIATIONS } from "@ankaa/core/shared/constants/intensity-technique";
import { SECTIONS } from "@ankaa/core/shared/constants/section";
import { SET_TYPES } from "@ankaa/core/shared/constants/set-type";
import { WEIGHT_TYPES } from "@ankaa/core/shared/constants/weight-type";
import * as Schema from "effect/Schema";

export type WorkoutDocument = typeof workoutDocumentSchema.Type;

export type WorkoutDocumentExercise = WorkoutDocument["exercises"][number];

export type WorkoutDocumentExerciseSet =
  WorkoutDocumentExercise["sets"][number];

export type WorkoutDocumentExerciseSetSegment =
  WorkoutDocumentExerciseSet["segments"][number];

export type WorkoutDocumentRestTimer =
  typeof workoutDocumentRestTimerSchema.Type;

export type WorkoutDocumentRoutineExerciseSet =
  WorkoutDocumentExercise["routineExerciseSets"][number];

const workoutDocumentRestTimerSchema = Schema.Struct({
  restNotificationId: Schema.optional(Schema.String),
  restSeconds: Schema.Finite,
  startedAt: Schema.String,
});

const workoutDocumentRoutineExerciseSetSchema = Schema.Struct({
  amount: Schema.optional(Schema.Finite),
  dropSetSegmentCount: Schema.optional(Schema.Finite),
  dropSetWeightPercentage: Schema.optional(Schema.Finite),
  isToFailure: Schema.Boolean,
  restPauseRestSeconds: Schema.optional(Schema.Finite),
  restPauseSegmentCount: Schema.optional(Schema.Finite),
  restSeconds: Schema.optional(Schema.Finite),
  setType: Schema.Literals(SET_TYPES),
  tempo: Schema.optional(Schema.String),
  variation: Schema.optional(Schema.Literals(VARIATIONS)),
});

const workoutDocumentExerciseSetSegmentSchema = Schema.Struct({
  amount: Schema.String,
  id: Schema.String,
  weightUnit: Schema.optional(Schema.Literals(WEIGHT_UNITS)),
  weightValue: Schema.String,
});

const workoutDocumentExerciseSetSchema = Schema.Struct({
  id: Schema.String,
  isToFailure: Schema.Boolean,
  segments: Schema.Array(workoutDocumentExerciseSetSegmentSchema),
  setType: Schema.Literals(SET_TYPES),
  tempo: Schema.optional(Schema.String),
  variation: Schema.optional(Schema.Literals(VARIATIONS)),
});

const workoutDocumentExerciseSchema = Schema.Struct({
  amountUnit: Schema.Literals(AMOUNT_UNITS),
  exerciseId: Schema.String,
  id: Schema.String,
  note: Schema.String,
  routineExerciseNote: Schema.optional(Schema.String),
  routineExerciseSets: Schema.Array(workoutDocumentRoutineExerciseSetSchema),
  section: Schema.Literals(SECTIONS),
  sets: Schema.Array(workoutDocumentExerciseSetSchema),
  skipReason: Schema.optional(Schema.Literals(SKIP_REASONS)),
  skipReasonNote: Schema.String,
  superset: Schema.optional(Schema.Finite),
  warmUpForWorkoutExerciseId: Schema.optional(Schema.String),
  weightType: Schema.Literals(WEIGHT_TYPES),
});

export const workoutDocumentSchema = Schema.Struct({
  endedAt: Schema.optional(Schema.String),
  exercises: Schema.Array(workoutDocumentExerciseSchema),
  id: Schema.String,
  restTimer: Schema.optional(workoutDocumentRestTimerSchema),
  routineId: Schema.String,
  startedAt: Schema.String,
  syncedVersion: Schema.Finite,
  userId: Schema.String,
  version: Schema.Finite,
});
