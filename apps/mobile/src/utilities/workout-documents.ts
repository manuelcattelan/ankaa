import {
  AMOUNT_UNITS,
  SECTIONS,
  SET_TYPES,
  SKIP_REASONS,
  VARIATIONS,
  WEIGHT_TYPES,
  WEIGHT_UNITS,
} from "@ankaa/database/constants";
import { z } from "zod";

export type WorkoutDocument = z.infer<typeof workoutDocumentSchema>;

export type WorkoutDocumentExercise = WorkoutDocument["exercises"][number];

export type WorkoutDocumentExerciseSet =
  WorkoutDocumentExercise["sets"][number];

export type WorkoutDocumentExerciseSetSegment =
  WorkoutDocumentExerciseSet["segments"][number];

export type WorkoutDocumentRestTimer = z.infer<
  typeof workoutDocumentRestTimerSchema
>;

export type WorkoutDocumentRoutineExerciseSet =
  WorkoutDocumentExercise["routineExerciseSets"][number];

export type WorkoutDocumentsAction =
  | { endedAt: string; type: "stoppedWorkout"; workoutId: string }
  | {
      note: string;
      type: "changedExerciseNote";
      workoutExerciseId: string;
      workoutId: string;
    }
  | {
      restTimer: WorkoutDocumentRestTimer;
      type: "startedRestTimer";
      workoutId: string;
    }
  | {
      skipReason: SkipReason | undefined;
      type: "changedSkipReason";
      workoutExerciseId: string;
      workoutId: string;
    }
  | {
      skipReasonNote: string;
      type: "changedSkipReasonNote";
      workoutExerciseId: string;
      workoutId: string;
    }
  | {
      type: "addedSegment";
      workoutExerciseId: string;
      workoutExerciseSetId: string;
      workoutExerciseSetSegmentId: string;
      workoutId: string;
    }
  | {
      type: "addedSet";
      workoutExerciseId: string;
      workoutExerciseSetId: string;
      workoutExerciseSetSegmentId: string;
      workoutId: string;
    }
  | {
      type: "changedSegment";
      workoutExerciseId: string;
      workoutExerciseSetId: string;
      workoutExerciseSetSegment: WorkoutDocumentExerciseSetSegment;
      workoutId: string;
    }
  | { type: "removedSet"; workoutExerciseId: string; workoutId: string }
  | { type: "savedWorkout"; version: number; workoutId: string }
  | { type: "skippedRest"; workoutId: string }
  | { type: "startedWorkout"; workoutDocument: WorkoutDocument };

type GetWorkoutDocumentRoutineExerciseSetOptions = {
  position: number;
  workoutDocumentExercise: WorkoutDocumentExercise;
};

type SkipReason = (typeof SKIP_REASONS)[number];

const workoutDocumentRestTimerSchema = z.object({
  restNotificationId: z.string().optional(),
  restSeconds: z.number(),
  startedAt: z.string(),
});

const workoutDocumentRoutineExerciseSetSchema = z.object({
  amount: z.number().optional(),
  dropSetSegmentCount: z.number().optional(),
  dropSetWeightPercentage: z.number().optional(),
  isToFailure: z.boolean(),
  restPauseRestSeconds: z.number().optional(),
  restPauseSegmentCount: z.number().optional(),
  restSeconds: z.number().optional(),
  setType: z.enum(SET_TYPES),
  tempo: z.string().optional(),
  variation: z.enum(VARIATIONS).optional(),
});

const workoutDocumentExerciseSetSegmentSchema = z.object({
  amount: z.string(),
  id: z.string(),
  weightUnit: z.enum(WEIGHT_UNITS).optional(),
  weightValue: z.string(),
});

const workoutDocumentExerciseSetSchema = z.object({
  id: z.string(),
  isToFailure: z.boolean(),
  segments: z.array(workoutDocumentExerciseSetSegmentSchema),
  setType: z.enum(SET_TYPES),
  tempo: z.string().optional(),
  variation: z.enum(VARIATIONS).optional(),
});

const workoutDocumentExerciseSchema = z.object({
  amountUnit: z.enum(AMOUNT_UNITS),
  exerciseId: z.string(),
  id: z.string(),
  note: z.string(),
  routineExerciseNote: z.string().optional(),
  routineExerciseSets: z.array(workoutDocumentRoutineExerciseSetSchema),
  section: z.enum(SECTIONS),
  sets: z.array(workoutDocumentExerciseSetSchema),
  skipReason: z.enum(SKIP_REASONS).optional(),
  skipReasonNote: z.string(),
  superset: z.number().optional(),
  warmUpForWorkoutExerciseId: z.string().optional(),
  weightType: z.enum(WEIGHT_TYPES),
});

export const workoutDocumentSchema = z.object({
  endedAt: z.string().optional(),
  exercises: z.array(workoutDocumentExerciseSchema),
  id: z.string(),
  restTimer: workoutDocumentRestTimerSchema.optional(),
  routineId: z.string(),
  startedAt: z.string(),
  syncedVersion: z.number(),
  userId: z.string(),
  version: z.number(),
});

export function getWorkoutDocumentRoutineExerciseSet({
  position,
  workoutDocumentExercise,
}: GetWorkoutDocumentRoutineExerciseSetOptions) {
  return workoutDocumentExercise.routineExerciseSets.at(
    Math.min(position, workoutDocumentExercise.routineExerciseSets.length - 1),
  );
}
