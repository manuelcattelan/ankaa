import type { WorkoutDocument } from "@/features/workout/core/workout-document-schema";

import { getUnsyncedWorkoutDocument } from "@/features/workout/core/get-unsynced-workout-document";

const IN_PROGRESS_WORKOUT_DOCUMENT: WorkoutDocument = {
  exercises: [],
  id: "019a0000-0000-7000-8000-000000000301",
  routineId: "019a0000-0000-7000-8000-000000000201",
  startedAt: "2026-10-19T08:00:00.000Z",
  syncedVersion: 2,
  userId: "019a0000-0000-7000-8000-000000000401",
  version: 4,
};

const EARLIER_ENDED_WORKOUT_DOCUMENT: WorkoutDocument = {
  ...IN_PROGRESS_WORKOUT_DOCUMENT,
  endedAt: "2026-10-17T09:00:00.000Z",
  id: "019a0000-0000-7000-8000-000000000302",
  startedAt: "2026-10-17T08:00:00.000Z",
};

const LATER_ENDED_WORKOUT_DOCUMENT: WorkoutDocument = {
  ...IN_PROGRESS_WORKOUT_DOCUMENT,
  endedAt: "2026-10-18T09:00:00.000Z",
  id: "019a0000-0000-7000-8000-000000000303",
  startedAt: "2026-10-18T08:00:00.000Z",
};

describe("getUnsyncedWorkoutDocument", () => {
  it("returns the Workout document with unsaved changes that ended first, before the others", () => {
    expect(
      getUnsyncedWorkoutDocument({
        failedWorkoutSaves: [],
        workoutDocuments: [
          IN_PROGRESS_WORKOUT_DOCUMENT,
          LATER_ENDED_WORKOUT_DOCUMENT,
          EARLIER_ENDED_WORKOUT_DOCUMENT,
        ],
      }),
    ).toEqual(EARLIER_ENDED_WORKOUT_DOCUMENT);
  });

  it("returns the Workout document in progress when no ended one has unsaved changes", () => {
    expect(
      getUnsyncedWorkoutDocument({
        failedWorkoutSaves: [],
        workoutDocuments: [
          { ...EARLIER_ENDED_WORKOUT_DOCUMENT, syncedVersion: 4 },
          IN_PROGRESS_WORKOUT_DOCUMENT,
        ],
      }),
    ).toEqual(IN_PROGRESS_WORKOUT_DOCUMENT);
  });

  it("skips a Workout document whose Save of its current version failed", () => {
    expect(
      getUnsyncedWorkoutDocument({
        failedWorkoutSaves: [
          { version: 4, workoutId: "019a0000-0000-7000-8000-000000000302" },
        ],
        workoutDocuments: [
          EARLIER_ENDED_WORKOUT_DOCUMENT,
          LATER_ENDED_WORKOUT_DOCUMENT,
        ],
      }),
    ).toEqual(LATER_ENDED_WORKOUT_DOCUMENT);
  });

  it("returns a Workout document whose Save failed for an earlier version", () => {
    expect(
      getUnsyncedWorkoutDocument({
        failedWorkoutSaves: [
          { version: 3, workoutId: "019a0000-0000-7000-8000-000000000302" },
        ],
        workoutDocuments: [
          EARLIER_ENDED_WORKOUT_DOCUMENT,
          LATER_ENDED_WORKOUT_DOCUMENT,
        ],
      }),
    ).toEqual(EARLIER_ENDED_WORKOUT_DOCUMENT);
  });

  it("returns nothing when no Workout document has unsaved changes", () => {
    expect(
      getUnsyncedWorkoutDocument({
        failedWorkoutSaves: [],
        workoutDocuments: [
          { ...IN_PROGRESS_WORKOUT_DOCUMENT, syncedVersion: 4 },
          { ...EARLIER_ENDED_WORKOUT_DOCUMENT, syncedVersion: 4 },
        ],
      }),
    ).toBe(undefined);
  });
});
