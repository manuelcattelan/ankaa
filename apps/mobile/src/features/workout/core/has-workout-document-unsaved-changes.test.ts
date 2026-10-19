import type { WorkoutDocument } from "@/features/workout/core/workout-document-schema";

import { hasWorkoutDocumentUnsavedChanges } from "@/features/workout/core/has-workout-document-unsaved-changes";

const WORKOUT_DOCUMENT: WorkoutDocument = {
  exercises: [],
  id: "019a0000-0000-7000-8000-000000000301",
  routineId: "019a0000-0000-7000-8000-000000000201",
  startedAt: "2026-10-19T08:00:00.000Z",
  syncedVersion: 3,
  userId: "019a0000-0000-7000-8000-000000000401",
  version: 3,
};

describe("hasWorkoutDocumentUnsavedChanges", () => {
  it("finds unsaved changes when the version is newer than the version of the last Save", () => {
    expect(
      hasWorkoutDocumentUnsavedChanges({ ...WORKOUT_DOCUMENT, version: 4 }),
    ).toBe(true);
  });

  it("finds no unsaved changes when the last Save has the current version", () => {
    expect(hasWorkoutDocumentUnsavedChanges(WORKOUT_DOCUMENT)).toBe(false);
  });
});
