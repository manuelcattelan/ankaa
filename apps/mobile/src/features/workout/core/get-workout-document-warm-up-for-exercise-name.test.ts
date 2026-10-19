import type {
  WorkoutDocument,
  WorkoutDocumentExercise,
} from "@/features/workout/core/workout-document-schema";

import { getWorkoutDocumentWarmUpForExerciseName } from "@/features/workout/core/get-workout-document-warm-up-for-exercise-name";

const PUSH_UP_WORKOUT_DOCUMENT_EXERCISE: WorkoutDocumentExercise = {
  amountUnit: "repetition",
  exerciseId: "019a0000-0000-7000-8000-000000000004",
  id: "019a0000-0000-7000-8000-000000000501",
  note: "",
  routineExerciseSets: [],
  section: "main",
  sets: [],
  skipReasonNote: "",
  warmUpForWorkoutExerciseId: "019a0000-0000-7000-8000-000000000502",
  weightType: "bodyweight",
};

const BENCH_PRESS_WORKOUT_DOCUMENT_EXERCISE: WorkoutDocumentExercise = {
  amountUnit: "repetition",
  exerciseId: "019a0000-0000-7000-8000-000000000001",
  id: "019a0000-0000-7000-8000-000000000502",
  note: "",
  routineExerciseSets: [],
  section: "main",
  sets: [],
  skipReasonNote: "",
  weightType: "total",
};

const WORKOUT_DOCUMENT: WorkoutDocument = {
  exercises: [
    PUSH_UP_WORKOUT_DOCUMENT_EXERCISE,
    BENCH_PRESS_WORKOUT_DOCUMENT_EXERCISE,
  ],
  id: "019a0000-0000-7000-8000-000000000301",
  routineId: "019a0000-0000-7000-8000-000000000201",
  startedAt: "2026-10-19T08:00:00.000Z",
  syncedVersion: 0,
  userId: "019a0000-0000-7000-8000-000000000401",
  version: 1,
};

const EXERCISE_NAMES = new Map([
  ["019a0000-0000-7000-8000-000000000001", "Bench Press (Barbell)"],
  ["019a0000-0000-7000-8000-000000000004", "Push-up"],
]);

describe("getWorkoutDocumentWarmUpForExerciseName", () => {
  it("returns the name of the Exercise that a Warm-up exercise prepares for", () => {
    expect(
      getWorkoutDocumentWarmUpForExerciseName({
        exerciseNames: EXERCISE_NAMES,
        warmUpWorkoutDocumentExercise: PUSH_UP_WORKOUT_DOCUMENT_EXERCISE,
        workoutDocument: WORKOUT_DOCUMENT,
      }),
    ).toBe("Bench Press (Barbell)");
  });

  it("returns no name for a Workout exercise that isn't a Warm-up exercise", () => {
    expect(
      getWorkoutDocumentWarmUpForExerciseName({
        exerciseNames: EXERCISE_NAMES,
        warmUpWorkoutDocumentExercise: BENCH_PRESS_WORKOUT_DOCUMENT_EXERCISE,
        workoutDocument: WORKOUT_DOCUMENT,
      }),
    ).toBe(undefined);
  });

  it("returns an empty name when the Exercise it prepares for isn't loaded", () => {
    expect(
      getWorkoutDocumentWarmUpForExerciseName({
        exerciseNames: new Map(),
        warmUpWorkoutDocumentExercise: PUSH_UP_WORKOUT_DOCUMENT_EXERCISE,
        workoutDocument: WORKOUT_DOCUMENT,
      }),
    ).toBe("");
  });

  it("returns an empty name when the Workout exercise it prepares for isn't in the Workout", () => {
    expect(
      getWorkoutDocumentWarmUpForExerciseName({
        exerciseNames: EXERCISE_NAMES,
        warmUpWorkoutDocumentExercise: PUSH_UP_WORKOUT_DOCUMENT_EXERCISE,
        workoutDocument: {
          ...WORKOUT_DOCUMENT,
          exercises: [PUSH_UP_WORKOUT_DOCUMENT_EXERCISE],
        },
      }),
    ).toBe("");
  });
});
