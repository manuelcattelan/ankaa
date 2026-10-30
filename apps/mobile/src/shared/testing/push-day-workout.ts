import type { Workout } from "#/shared/workout.ts";

/**
 * A Workout in progress of one Bench Press (Barbell) with one planned
 * Working set and nothing recorded yet.
 */
export const PUSH_DAY_WORKOUT: Workout = {
  id: "01900000-0000-7000-8000-000000000101",
  sections: {
    coolDown: [],
    main: [
      {
        exercises: [
          {
            amountUnit: "repetition",
            exerciseId: "01900000-0000-7000-8000-000000000001",
            id: "01900000-0000-7000-8000-000000000102",
            note: null,
            plannedNote: null,
            plannedSets: [
              {
                amount: 8,
                id: "01900000-0000-7000-8000-000000000103",
                intensityTechnique: null,
                isToFailure: false,
                restSeconds: 120,
                tempo: null,
                type: "working",
              },
            ],
            recordedSets: [],
            skipNote: null,
            skipReason: null,
            warmUpExercises: [],
            weightType: "total",
            weightUnit: "kilogram",
          },
        ],
        id: "01900000-0000-7000-8000-000000000104",
      },
    ],
    warmUp: [],
  },
  startedAt: "2026-10-29T09:00:00.000Z",
};
