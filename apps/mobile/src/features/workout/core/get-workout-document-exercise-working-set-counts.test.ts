import type {
  WorkoutDocumentExercise,
  WorkoutDocumentExerciseSet,
} from "@/features/workout/core/workout-document-schema";

import { getWorkoutDocumentExerciseWorkingSetCounts } from "@/features/workout/core/get-workout-document-exercise-working-set-counts";

const WARM_UP_SET: WorkoutDocumentExerciseSet = {
  id: "019a0000-0000-7000-8000-000000000601",
  isToFailure: false,
  segments: [],
  setType: "warm_up",
};

const WORKING_SET: WorkoutDocumentExerciseSet = {
  id: "019a0000-0000-7000-8000-000000000602",
  isToFailure: false,
  segments: [],
  setType: "working",
};

const WORKOUT_DOCUMENT_EXERCISE: WorkoutDocumentExercise = {
  amountUnit: "repetition",
  exerciseId: "019a0000-0000-7000-8000-000000000001",
  id: "019a0000-0000-7000-8000-000000000501",
  note: "",
  routineExerciseSets: [
    { amount: 12, isToFailure: false, setType: "warm_up" },
    { amount: 8, isToFailure: false, setType: "working" },
    { amount: 8, isToFailure: false, setType: "working" },
    { amount: 8, isToFailure: false, setType: "working" },
  ],
  section: "main",
  sets: [],
  skipReasonNote: "",
  weightType: "total",
};

describe("getWorkoutDocumentExerciseWorkingSetCounts", () => {
  it("counts the Working sets done and left, leaving out Warm-up sets", () => {
    expect(
      getWorkoutDocumentExerciseWorkingSetCounts({
        ...WORKOUT_DOCUMENT_EXERCISE,
        sets: [WARM_UP_SET, WORKING_SET],
      }),
    ).toEqual({ workingSetDoneCount: 1, workingSetLeftCount: 2 });
  });

  it("counts no Working set left once more Working sets are done than planned", () => {
    expect(
      getWorkoutDocumentExerciseWorkingSetCounts({
        ...WORKOUT_DOCUMENT_EXERCISE,
        sets: [WORKING_SET, WORKING_SET, WORKING_SET, WORKING_SET],
      }),
    ).toEqual({ workingSetDoneCount: 4, workingSetLeftCount: 0 });
  });
});
