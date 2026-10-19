import type { WorkoutDocument } from "@/features/workout/core/workout-document-schema";

import { getWorkoutDocumentStorageChanges } from "@/features/workout/core/get-workout-document-storage-changes";

const WORKOUT_DOCUMENT: WorkoutDocument = {
  exercises: [],
  id: "019a0000-0000-7000-8000-000000000301",
  routineId: "019a0000-0000-7000-8000-000000000201",
  startedAt: "2026-10-19T08:00:00.000Z",
  syncedVersion: 0,
  userId: "019a0000-0000-7000-8000-000000000401",
  version: 2,
};

const WORKOUT_DOCUMENT_JSON =
  '{"exercises":[],"id":"019a0000-0000-7000-8000-000000000301","routineId":"019a0000-0000-7000-8000-000000000201","startedAt":"2026-10-19T08:00:00.000Z","syncedVersion":0,"userId":"019a0000-0000-7000-8000-000000000401","version":2}';

const ENDED_WORKOUT_DOCUMENT_JSON =
  '{"endedAt":"2026-10-18T09:00:00.000Z","exercises":[],"id":"019a0000-0000-7000-8000-000000000302","routineId":"019a0000-0000-7000-8000-000000000201","startedAt":"2026-10-18T08:00:00.000Z","syncedVersion":5,"userId":"019a0000-0000-7000-8000-000000000401","version":5}';

describe("getWorkoutDocumentStorageChanges", () => {
  it("writes a Workout document that isn't Stored yet", () => {
    expect(
      getWorkoutDocumentStorageChanges({
        storedWorkoutDocumentJsons: [],
        workoutDocuments: [WORKOUT_DOCUMENT],
      }),
    ).toEqual({
      _tag: "WorkoutDocumentStorageChangesFound",
      removedWorkoutIds: [],
      writtenWorkoutDocumentJsons: [
        {
          workoutDocumentJson: WORKOUT_DOCUMENT_JSON,
          workoutId: "019a0000-0000-7000-8000-000000000301",
        },
      ],
    });
  });

  it("writes a Workout document that changed since it was Stored", () => {
    expect(
      getWorkoutDocumentStorageChanges({
        storedWorkoutDocumentJsons: [
          {
            workoutDocumentJson:
              '{"exercises":[],"id":"019a0000-0000-7000-8000-000000000301","routineId":"019a0000-0000-7000-8000-000000000201","startedAt":"2026-10-19T08:00:00.000Z","syncedVersion":0,"userId":"019a0000-0000-7000-8000-000000000401","version":1}',
            workoutId: "019a0000-0000-7000-8000-000000000301",
          },
        ],
        workoutDocuments: [WORKOUT_DOCUMENT],
      }),
    ).toEqual({
      _tag: "WorkoutDocumentStorageChangesFound",
      removedWorkoutIds: [],
      writtenWorkoutDocumentJsons: [
        {
          workoutDocumentJson: WORKOUT_DOCUMENT_JSON,
          workoutId: "019a0000-0000-7000-8000-000000000301",
        },
      ],
    });
  });

  it("writes nothing for a Workout document that is Stored as it is", () => {
    expect(
      getWorkoutDocumentStorageChanges({
        storedWorkoutDocumentJsons: [
          {
            workoutDocumentJson: WORKOUT_DOCUMENT_JSON,
            workoutId: "019a0000-0000-7000-8000-000000000301",
          },
        ],
        workoutDocuments: [WORKOUT_DOCUMENT],
      }),
    ).toEqual({
      _tag: "WorkoutDocumentStorageChangesFound",
      removedWorkoutIds: [],
      writtenWorkoutDocumentJsons: [],
    });
  });

  it("removes a Stored Workout document that is no longer kept", () => {
    expect(
      getWorkoutDocumentStorageChanges({
        storedWorkoutDocumentJsons: [
          {
            workoutDocumentJson: ENDED_WORKOUT_DOCUMENT_JSON,
            workoutId: "019a0000-0000-7000-8000-000000000302",
          },
        ],
        workoutDocuments: [],
      }),
    ).toEqual({
      _tag: "WorkoutDocumentStorageChangesFound",
      removedWorkoutIds: ["019a0000-0000-7000-8000-000000000302"],
      writtenWorkoutDocumentJsons: [],
    });
  });

  it("keeps a Stored Workout document that isn't valid", () => {
    expect(
      getWorkoutDocumentStorageChanges({
        storedWorkoutDocumentJsons: [
          {
            workoutDocumentJson:
              '{"id":"019a0000-0000-7000-8000-000000000302"}',
            workoutId: "019a0000-0000-7000-8000-000000000302",
          },
        ],
        workoutDocuments: [],
      }),
    ).toEqual({
      _tag: "WorkoutDocumentStorageChangesFound",
      removedWorkoutIds: [],
      writtenWorkoutDocumentJsons: [],
    });
  });

  it("reports a Stored Workout document that is no longer kept and isn't JSON as malformed", () => {
    expect(
      getWorkoutDocumentStorageChanges({
        storedWorkoutDocumentJsons: [
          {
            workoutDocumentJson: '{"id":',
            workoutId: "019a0000-0000-7000-8000-000000000302",
          },
        ],
        workoutDocuments: [WORKOUT_DOCUMENT],
      }),
    ).toEqual({
      _tag: "StoredWorkoutDocumentJsonMalformed",
      cause: new SyntaxError("Unexpected end of JSON input"),
    });
  });

  it("overwrites a Stored Workout document that isn't JSON when the Workout document is still kept", () => {
    expect(
      getWorkoutDocumentStorageChanges({
        storedWorkoutDocumentJsons: [
          {
            workoutDocumentJson: '{"id":',
            workoutId: "019a0000-0000-7000-8000-000000000301",
          },
        ],
        workoutDocuments: [WORKOUT_DOCUMENT],
      }),
    ).toEqual({
      _tag: "WorkoutDocumentStorageChangesFound",
      removedWorkoutIds: [],
      writtenWorkoutDocumentJsons: [
        {
          workoutDocumentJson: WORKOUT_DOCUMENT_JSON,
          workoutId: "019a0000-0000-7000-8000-000000000301",
        },
      ],
    });
  });
});
