import type { Exercise } from "@/shared/interactors/list-exercises";

import { getExerciseNames } from "@/shared/core/get-exercise-names";

const BENCH_PRESS_EXERCISE: Exercise = {
  amountUnit: "repetition",
  exerciseEquipment: [{ equipment: "barbell" }, { equipment: "bench" }],
  exerciseMuscleGroups: [{ muscleGroup: "chest", muscleGroupRole: "primary" }],
  id: "019a0000-0000-7000-8000-000000000001",
  name: "Bench Press (Barbell)",
  weightType: "total",
};

const PUSH_UP_EXERCISE: Exercise = {
  amountUnit: "repetition",
  exerciseEquipment: [],
  exerciseMuscleGroups: [{ muscleGroup: "chest", muscleGroupRole: "primary" }],
  id: "019a0000-0000-7000-8000-000000000004",
  name: "Push-up",
  weightType: "bodyweight",
};

describe("getExerciseNames", () => {
  it("maps the identifier of each Exercise to its name", () => {
    expect(getExerciseNames([BENCH_PRESS_EXERCISE, PUSH_UP_EXERCISE])).toEqual(
      new Map([
        ["019a0000-0000-7000-8000-000000000001", "Bench Press (Barbell)"],
        ["019a0000-0000-7000-8000-000000000004", "Push-up"],
      ]),
    );
  });

  it("returns an empty map while the Exercises aren't loaded", () => {
    expect(getExerciseNames(undefined)).toEqual(new Map());
  });
});
