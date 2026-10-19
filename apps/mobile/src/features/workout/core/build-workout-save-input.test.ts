import type {
  WorkoutDocument,
  WorkoutDocumentExercise,
  WorkoutDocumentExerciseSet,
} from "@/features/workout/core/workout-document-schema";

import { buildWorkoutSaveInput } from "@/features/workout/core/build-workout-save-input";

const WORKOUT_DOCUMENT_EXERCISE_SET: WorkoutDocumentExerciseSet = {
  id: "019a0000-0000-7000-8000-000000000601",
  isToFailure: true,
  segments: [
    {
      amount: " 8 ",
      id: "019a0000-0000-7000-8000-000000000701",
      weightUnit: "kilogram",
      weightValue: "82,5",
    },
    {
      amount: "6",
      id: "019a0000-0000-7000-8000-000000000702",
      weightUnit: "kilogram",
      weightValue: "65",
    },
  ],
  setType: "working",
  tempo: "3-1-X-0",
  variation: "drop_set",
};

const WORKOUT_DOCUMENT_EXERCISE: WorkoutDocumentExercise = {
  amountUnit: "repetition",
  exerciseId: "019a0000-0000-7000-8000-000000000001",
  id: "019a0000-0000-7000-8000-000000000502",
  note: "  Felt strong  ",
  routineExerciseNote: "Pause on the chest",
  routineExerciseSets: [],
  section: "main",
  sets: [WORKOUT_DOCUMENT_EXERCISE_SET],
  skipReasonNote: "",
  superset: 1,
  warmUpForWorkoutExerciseId: undefined,
  weightType: "total",
};

const WARM_UP_WORKOUT_DOCUMENT_EXERCISE: WorkoutDocumentExercise = {
  amountUnit: "repetition",
  exerciseId: "019a0000-0000-7000-8000-000000000004",
  id: "019a0000-0000-7000-8000-000000000501",
  note: " ",
  routineExerciseSets: [],
  section: "main",
  sets: [],
  skipReasonNote: "",
  warmUpForWorkoutExerciseId: "019a0000-0000-7000-8000-000000000502",
  weightType: "bodyweight",
};

const WORKOUT_DOCUMENT: WorkoutDocument = {
  exercises: [WARM_UP_WORKOUT_DOCUMENT_EXERCISE, WORKOUT_DOCUMENT_EXERCISE],
  id: "019a0000-0000-7000-8000-000000000301",
  routineId: "019a0000-0000-7000-8000-000000000201",
  startedAt: "2026-10-19T08:00:00.000Z",
  syncedVersion: 2,
  userId: "019a0000-0000-7000-8000-000000000401",
  version: 5,
};

describe("buildWorkoutSaveInput", () => {
  it("builds the Save of a Workout in progress, with positions, trimmed notes, parsed Amounts and weights, and null for each missing value", () => {
    expect(buildWorkoutSaveInput(WORKOUT_DOCUMENT)).toEqual({
      endedAt: null,
      exercises: [
        {
          amountUnit: "repetition",
          exerciseId: "019a0000-0000-7000-8000-000000000004",
          id: "019a0000-0000-7000-8000-000000000501",
          note: null,
          position: 0,
          section: "main",
          sets: [],
          skipReason: null,
          skipReasonNote: null,
          superset: null,
          warmUpForWorkoutExerciseId: "019a0000-0000-7000-8000-000000000502",
          weightType: "bodyweight",
        },
        {
          amountUnit: "repetition",
          exerciseId: "019a0000-0000-7000-8000-000000000001",
          id: "019a0000-0000-7000-8000-000000000502",
          note: "Felt strong",
          position: 1,
          section: "main",
          sets: [
            {
              id: "019a0000-0000-7000-8000-000000000601",
              isToFailure: true,
              position: 0,
              segments: [
                {
                  amount: 8,
                  id: "019a0000-0000-7000-8000-000000000701",
                  position: 0,
                  weightUnit: "kilogram",
                  weightValue: 82.5,
                },
                {
                  amount: 6,
                  id: "019a0000-0000-7000-8000-000000000702",
                  position: 1,
                  weightUnit: "kilogram",
                  weightValue: 65,
                },
              ],
              setType: "working",
              tempo: "3-1-X-0",
              variation: "drop_set",
            },
          ],
          skipReason: null,
          skipReasonNote: null,
          superset: 1,
          warmUpForWorkoutExerciseId: null,
          weightType: "total",
        },
      ],
      id: "019a0000-0000-7000-8000-000000000301",
      routineId: "019a0000-0000-7000-8000-000000000201",
      startedAt: "2026-10-19T08:00:00.000Z",
      version: 5,
    });
  });

  it("sends the end of a Workout that is stopped", () => {
    expect(
      buildWorkoutSaveInput({
        ...WORKOUT_DOCUMENT,
        endedAt: "2026-10-19T09:00:00.000Z",
      }).endedAt,
    ).toBe("2026-10-19T09:00:00.000Z");
  });

  it("sends no Amount for a Segment whose Amount isn't valid", () => {
    expect(
      buildWorkoutSaveInput({
        ...WORKOUT_DOCUMENT,
        exercises: [
          {
            ...WORKOUT_DOCUMENT_EXERCISE,
            sets: [
              {
                ...WORKOUT_DOCUMENT_EXERCISE_SET,
                segments: [
                  {
                    amount: "0",
                    id: "019a0000-0000-7000-8000-000000000701",
                    weightUnit: "kilogram",
                    weightValue: "80",
                  },
                ],
              },
            ],
          },
        ],
      }).exercises[0].sets[0].segments[0],
    ).toEqual({
      amount: null,
      id: "019a0000-0000-7000-8000-000000000701",
      position: 0,
      weightUnit: "kilogram",
      weightValue: 80,
    });
  });

  it("sends no weight value for a Segment whose weight isn't valid", () => {
    expect(
      buildWorkoutSaveInput({
        ...WORKOUT_DOCUMENT,
        exercises: [
          {
            ...WORKOUT_DOCUMENT_EXERCISE,
            sets: [
              {
                ...WORKOUT_DOCUMENT_EXERCISE_SET,
                segments: [
                  {
                    amount: "8",
                    id: "019a0000-0000-7000-8000-000000000701",
                    weightUnit: "kilogram",
                    weightValue: "80.125",
                  },
                ],
              },
            ],
          },
        ],
      }).exercises[0].sets[0].segments[0],
    ).toEqual({
      amount: 8,
      id: "019a0000-0000-7000-8000-000000000701",
      position: 0,
      weightUnit: "kilogram",
      weightValue: null,
    });
  });

  it("sends no weight for an Exercise whose Weight type has no weight", () => {
    expect(
      buildWorkoutSaveInput({
        ...WORKOUT_DOCUMENT,
        exercises: [
          {
            ...WORKOUT_DOCUMENT_EXERCISE,
            sets: [
              {
                ...WORKOUT_DOCUMENT_EXERCISE_SET,
                segments: [
                  {
                    amount: "8",
                    id: "019a0000-0000-7000-8000-000000000701",
                    weightUnit: "kilogram",
                    weightValue: "80",
                  },
                ],
              },
            ],
            weightType: "none",
          },
        ],
      }).exercises[0].sets[0].segments[0],
    ).toEqual({
      amount: 8,
      id: "019a0000-0000-7000-8000-000000000701",
      position: 0,
      weightUnit: null,
      weightValue: null,
    });
  });

  it("sends the skip reason and its trimmed note for a Skipped exercise", () => {
    expect(
      buildWorkoutSaveInput({
        ...WORKOUT_DOCUMENT,
        exercises: [
          {
            ...WORKOUT_DOCUMENT_EXERCISE,
            skipReason: "pain",
            skipReasonNote: "  Sore shoulder  ",
          },
        ],
      }).exercises[0],
    ).toMatchObject({ skipReason: "pain", skipReasonNote: "Sore shoulder" });
  });

  it("sends no skip reason note when the note of a Skipped exercise is blank", () => {
    expect(
      buildWorkoutSaveInput({
        ...WORKOUT_DOCUMENT,
        exercises: [
          {
            ...WORKOUT_DOCUMENT_EXERCISE,
            skipReason: "low_on_time",
            skipReasonNote: " ",
          },
        ],
      }).exercises[0],
    ).toMatchObject({ skipReason: "low_on_time", skipReasonNote: null });
  });

  it("sends no skip reason note for a Workout exercise that isn't skipped", () => {
    expect(
      buildWorkoutSaveInput({
        ...WORKOUT_DOCUMENT,
        exercises: [
          {
            ...WORKOUT_DOCUMENT_EXERCISE,
            skipReason: undefined,
            skipReasonNote: "Sore shoulder",
          },
        ],
      }).exercises[0],
    ).toMatchObject({ skipReason: null, skipReasonNote: null });
  });
});
