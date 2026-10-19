import type { Routine } from "@/shared/interactors/list-routines";

import { canStartWorkout } from "@/features/workout/core/can-start-workout";

const PUSH_DAY_ROUTINE: Routine = {
  days: ["monday"],
  exercises: [
    {
      exerciseId: "019a0000-0000-7000-8000-000000000001",
      id: "019a0000-0000-7000-8000-000000000101",
      note: null,
      position: 0,
      section: "main",
      sets: [],
      superset: null,
      warmUpForRoutineExerciseId: null,
    },
    {
      exerciseId: "019a0000-0000-7000-8000-000000000004",
      id: "019a0000-0000-7000-8000-000000000102",
      note: null,
      position: 1,
      section: "main",
      sets: [],
      superset: null,
      warmUpForRoutineExerciseId: null,
    },
  ],
  id: "019a0000-0000-7000-8000-000000000201",
  name: "Push day",
};

describe("canStartWorkout", () => {
  it("allows starting a Workout when every Exercise of the Routine is loaded", () => {
    expect(
      canStartWorkout({
        exerciseNames: new Map([
          ["019a0000-0000-7000-8000-000000000001", "Bench Press (Barbell)"],
          ["019a0000-0000-7000-8000-000000000004", "Push-up"],
        ]),
        routine: PUSH_DAY_ROUTINE,
      }),
    ).toBe(true);
  });

  it("doesn't allow starting a Workout when an Exercise of the Routine isn't loaded", () => {
    expect(
      canStartWorkout({
        exerciseNames: new Map([
          ["019a0000-0000-7000-8000-000000000001", "Bench Press (Barbell)"],
        ]),
        routine: PUSH_DAY_ROUTINE,
      }),
    ).toBe(false);
  });

  it("doesn't allow starting a Workout while no Exercise is loaded, even for a Routine without exercises", () => {
    expect(
      canStartWorkout({
        exerciseNames: new Map(),
        routine: { ...PUSH_DAY_ROUTINE, exercises: [] },
      }),
    ).toBe(false);
  });
});
