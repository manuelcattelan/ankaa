import { createRoutineDraft } from "#/features/routine/core/create-routine-draft.ts";
import { pushDayRoutine } from "#/shared/testing/push-day-routine.ts";

describe("createRoutineDraft", () => {
  it("creates an empty Draft, with no id yet, for a new Routine", () => {
    expect(createRoutineDraft(null)).toStrictEqual({
      days: [],
      id: "",
      name: "",
      sections: { coolDown: [], main: [], warmUp: [] },
    });
  });

  it("creates the Draft of an existing Routine by encoding it", () => {
    expect(createRoutineDraft(pushDayRoutine)).toStrictEqual({
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
                note: "",
                sets: [
                  {
                    amount: "8",
                    id: "01900000-0000-7000-8000-000000000003",
                    intensityTechnique: null,
                    isToFailure: false,
                    restSeconds: "120",
                    tempo: "",
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
    });
  });
});
