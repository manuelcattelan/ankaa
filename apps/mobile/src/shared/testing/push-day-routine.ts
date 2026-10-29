import type { Routine } from "#/shared/routine.ts";

export const pushDayRoutine: Routine = {
  days: ["monday"],
  id: "01900000-0000-7000-8000-000000000004",
  name: "Push day",
  sections: {
    coolDown: [],
    main: [
      {
        exercises: [
          {
            exerciseId: "01900000-0000-7000-8000-000000000001",
            id: "01900000-0000-7000-8000-000000000002",
            note: null,
            sets: [
              {
                amount: 8,
                id: "01900000-0000-7000-8000-000000000003",
                intensityTechnique: null,
                isToFailure: false,
                restSeconds: 120,
                tempo: null,
                type: "working",
              },
            ],
            warmUpExercises: [],
          },
        ],
        id: "01900000-0000-7000-8000-000000000005",
      },
    ],
    warmUp: [],
  },
};
