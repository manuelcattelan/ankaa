import type { WorkoutDocument } from "@/features/workout/core/workout-document-schema";

import { hasWorkoutSaveFailed } from "@/features/workout/core/has-workout-save-failed";

const UNSAVED_WORKOUT_DOCUMENT: WorkoutDocument = {
  exercises: [],
  id: "019a0000-0000-7000-8000-000000000301",
  routineId: "019a0000-0000-7000-8000-000000000201",
  startedAt: "2026-10-19T08:00:00.000Z",
  syncedVersion: 2,
  userId: "019a0000-0000-7000-8000-000000000401",
  version: 4,
};

describe("hasWorkoutSaveFailed", () => {
  it("finds a failed Save when a Workout document with unsaved changes has one", () => {
    expect(
      hasWorkoutSaveFailed({
        failedWorkoutSaves: [
          { version: 4, workoutId: "019a0000-0000-7000-8000-000000000301" },
        ],
        workoutDocuments: [UNSAVED_WORKOUT_DOCUMENT],
      }),
    ).toBe(true);
  });

  it("finds a failed Save when it was for an earlier version of a Workout document that still has unsaved changes", () => {
    expect(
      hasWorkoutSaveFailed({
        failedWorkoutSaves: [
          { version: 3, workoutId: "019a0000-0000-7000-8000-000000000301" },
        ],
        workoutDocuments: [UNSAVED_WORKOUT_DOCUMENT],
      }),
    ).toBe(true);
  });

  it("finds no failed Save once the Workout document has no unsaved changes", () => {
    expect(
      hasWorkoutSaveFailed({
        failedWorkoutSaves: [
          { version: 4, workoutId: "019a0000-0000-7000-8000-000000000301" },
        ],
        workoutDocuments: [{ ...UNSAVED_WORKOUT_DOCUMENT, syncedVersion: 4 }],
      }),
    ).toBe(false);
  });

  it("finds no failed Save when only another Workout has one", () => {
    expect(
      hasWorkoutSaveFailed({
        failedWorkoutSaves: [
          { version: 4, workoutId: "019a0000-0000-7000-8000-000000000302" },
        ],
        workoutDocuments: [UNSAVED_WORKOUT_DOCUMENT],
      }),
    ).toBe(false);
  });
});
