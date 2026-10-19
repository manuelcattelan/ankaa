import type { WorkoutDocument } from "@/features/workout/core/workout-document-schema";

import { parseStoredWorkoutDocument } from "@/features/workout/core/parse-stored-workout-document";

const WORKOUT_DOCUMENT: WorkoutDocument = {
  exercises: [
    {
      amountUnit: "repetition",
      exerciseId: "019a0000-0000-7000-8000-000000000001",
      id: "019a0000-0000-7000-8000-000000000501",
      note: "",
      routineExerciseSets: [
        { amount: 8, isToFailure: false, restSeconds: 120, setType: "working" },
      ],
      section: "main",
      sets: [
        {
          id: "019a0000-0000-7000-8000-000000000601",
          isToFailure: false,
          segments: [
            {
              amount: "8",
              id: "019a0000-0000-7000-8000-000000000701",
              weightUnit: "kilogram",
              weightValue: "80",
            },
          ],
          setType: "working",
        },
      ],
      skipReasonNote: "",
      weightType: "total",
    },
  ],
  id: "019a0000-0000-7000-8000-000000000301",
  restTimer: { restSeconds: 120, startedAt: "2026-10-19T08:10:00.000Z" },
  routineId: "019a0000-0000-7000-8000-000000000201",
  startedAt: "2026-10-19T08:00:00.000Z",
  syncedVersion: 2,
  userId: "019a0000-0000-7000-8000-000000000401",
  version: 3,
};

describe("parseStoredWorkoutDocument", () => {
  it("parses a Stored Workout document", () => {
    expect(
      parseStoredWorkoutDocument(JSON.stringify(WORKOUT_DOCUMENT)),
    ).toEqual({
      _tag: "StoredWorkoutDocumentParsed",
      workoutDocument: WORKOUT_DOCUMENT,
    });
  });

  it("rejects a JSON that isn't a Workout document as invalid", () => {
    expect(
      parseStoredWorkoutDocument(
        JSON.stringify({ ...WORKOUT_DOCUMENT, version: "3" }),
      ),
    ).toEqual({ _tag: "StoredWorkoutDocumentInvalid" });
  });

  it("rejects a missing Workout document as invalid", () => {
    expect(parseStoredWorkoutDocument(null)).toEqual({
      _tag: "StoredWorkoutDocumentInvalid",
    });
  });

  it("rejects an empty text as invalid", () => {
    expect(parseStoredWorkoutDocument("")).toEqual({
      _tag: "StoredWorkoutDocumentInvalid",
    });
  });

  it("reports a text that isn't JSON as malformed, with the parse error as its cause", () => {
    expect(parseStoredWorkoutDocument('{"id":')).toEqual({
      _tag: "StoredWorkoutDocumentJsonMalformed",
      cause: new SyntaxError("Unexpected end of JSON input"),
    });
  });
});
