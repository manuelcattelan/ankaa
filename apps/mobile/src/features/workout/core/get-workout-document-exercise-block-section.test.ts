import type { WorkoutDocumentExercise } from "@/features/workout/core/workout-document-schema";

import { getWorkoutDocumentExerciseBlockSection } from "@/features/workout/core/get-workout-document-exercise-block-section";

const WORKOUT_DOCUMENT_EXERCISE: WorkoutDocumentExercise = {
  amountUnit: "repetition",
  exerciseId: "019a0000-0000-7000-8000-000000000001",
  id: "019a0000-0000-7000-8000-000000000501",
  note: "",
  routineExerciseSets: [],
  section: "cool_down",
  sets: [],
  skipReasonNote: "",
  weightType: "total",
};

describe("getWorkoutDocumentExerciseBlockSection", () => {
  it("returns the Section of a Workout exercise", () => {
    expect(
      getWorkoutDocumentExerciseBlockSection(WORKOUT_DOCUMENT_EXERCISE),
    ).toBe("cool_down");
  });

  it("returns the main Section for a Warm-up exercise", () => {
    expect(
      getWorkoutDocumentExerciseBlockSection({
        ...WORKOUT_DOCUMENT_EXERCISE,
        section: "warm_up",
        warmUpForWorkoutExerciseId: "019a0000-0000-7000-8000-000000000502",
      }),
    ).toBe("main");
  });
});
