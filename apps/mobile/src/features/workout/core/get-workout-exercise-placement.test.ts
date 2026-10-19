import type { WorkoutDocumentExercise } from "@/features/workout/core/workout-document-schema";

import { getWorkoutExercisePlacement } from "@/features/workout/core/get-workout-exercise-placement";

const WARM_UP_SECTION_WORKOUT_DOCUMENT_EXERCISE: WorkoutDocumentExercise = {
  amountUnit: "second",
  exerciseId: "019a0000-0000-7000-8000-000000000010",
  id: "019a0000-0000-7000-8000-000000000501",
  note: "",
  routineExerciseSets: [],
  section: "warm_up",
  sets: [],
  skipReasonNote: "",
  weightType: "none",
};

const WARM_UP_WORKOUT_DOCUMENT_EXERCISE: WorkoutDocumentExercise = {
  amountUnit: "repetition",
  exerciseId: "019a0000-0000-7000-8000-000000000004",
  id: "019a0000-0000-7000-8000-000000000502",
  note: "",
  routineExerciseSets: [],
  section: "warm_up",
  sets: [],
  skipReasonNote: "",
  warmUpForWorkoutExerciseId: "019a0000-0000-7000-8000-000000000503",
  weightType: "bodyweight",
};

const FIRST_SUPERSET_WORKOUT_DOCUMENT_EXERCISE: WorkoutDocumentExercise = {
  amountUnit: "repetition",
  exerciseId: "019a0000-0000-7000-8000-000000000001",
  id: "019a0000-0000-7000-8000-000000000503",
  note: "",
  routineExerciseSets: [],
  section: "main",
  sets: [],
  skipReasonNote: "",
  superset: 1,
  weightType: "total",
};

const SECOND_SUPERSET_WORKOUT_DOCUMENT_EXERCISE: WorkoutDocumentExercise = {
  amountUnit: "repetition",
  exerciseId: "019a0000-0000-7000-8000-000000000002",
  id: "019a0000-0000-7000-8000-000000000504",
  note: "",
  routineExerciseSets: [],
  section: "main",
  sets: [],
  skipReasonNote: "",
  superset: 1,
  weightType: "total",
};

const MAIN_WORKOUT_DOCUMENT_EXERCISE: WorkoutDocumentExercise = {
  amountUnit: "repetition",
  exerciseId: "019a0000-0000-7000-8000-000000000003",
  id: "019a0000-0000-7000-8000-000000000505",
  note: "",
  routineExerciseSets: [],
  section: "main",
  sets: [],
  skipReasonNote: "",
  weightType: "single",
};

const WORKOUT_DOCUMENT_EXERCISES = [
  WARM_UP_SECTION_WORKOUT_DOCUMENT_EXERCISE,
  WARM_UP_WORKOUT_DOCUMENT_EXERCISE,
  FIRST_SUPERSET_WORKOUT_DOCUMENT_EXERCISE,
  SECOND_SUPERSET_WORKOUT_DOCUMENT_EXERCISE,
  MAIN_WORKOUT_DOCUMENT_EXERCISE,
];

describe("getWorkoutExercisePlacement", () => {
  it("places the first Workout exercise at the start of its Section", () => {
    expect(
      getWorkoutExercisePlacement({
        exerciseIndex: 0,
        workoutDocumentExercises: WORKOUT_DOCUMENT_EXERCISES,
      }),
    ).toEqual({
      isLastExerciseOfRound: true,
      isSectionStart: true,
      isSupersetStart: false,
    });
  });

  it("places a Warm-up exercise at the start of the main Section, whatever Section it has", () => {
    expect(
      getWorkoutExercisePlacement({
        exerciseIndex: 1,
        workoutDocumentExercises: WORKOUT_DOCUMENT_EXERCISES,
      }),
    ).toEqual({
      isLastExerciseOfRound: true,
      isSectionStart: true,
      isSupersetStart: false,
    });
  });

  it("places the first exercise of a Superset at its start, before the end of its round", () => {
    expect(
      getWorkoutExercisePlacement({
        exerciseIndex: 2,
        workoutDocumentExercises: WORKOUT_DOCUMENT_EXERCISES,
      }),
    ).toEqual({
      isLastExerciseOfRound: false,
      isSectionStart: false,
      isSupersetStart: true,
    });
  });

  it("places the last exercise of a Superset at the end of its round", () => {
    expect(
      getWorkoutExercisePlacement({
        exerciseIndex: 3,
        workoutDocumentExercises: WORKOUT_DOCUMENT_EXERCISES,
      }),
    ).toEqual({
      isLastExerciseOfRound: true,
      isSectionStart: false,
      isSupersetStart: false,
    });
  });

  it("places an exercise outside a Superset at the end of its round", () => {
    expect(
      getWorkoutExercisePlacement({
        exerciseIndex: 4,
        workoutDocumentExercises: WORKOUT_DOCUMENT_EXERCISES,
      }),
    ).toEqual({
      isLastExerciseOfRound: true,
      isSectionStart: false,
      isSupersetStart: false,
    });
  });

  it("starts a new Superset when the Superset number changes between two exercises next to each other", () => {
    expect(
      getWorkoutExercisePlacement({
        exerciseIndex: 1,
        workoutDocumentExercises: [
          FIRST_SUPERSET_WORKOUT_DOCUMENT_EXERCISE,
          { ...SECOND_SUPERSET_WORKOUT_DOCUMENT_EXERCISE, superset: 2 },
        ],
      }),
    ).toEqual({
      isLastExerciseOfRound: true,
      isSectionStart: false,
      isSupersetStart: true,
    });
  });
});
