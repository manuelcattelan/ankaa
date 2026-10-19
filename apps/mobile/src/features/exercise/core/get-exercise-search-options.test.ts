import type { Exercise } from "@/shared/interactors/list-exercises";

import { getExerciseSearchOptions } from "@/features/exercise/core/get-exercise-search-options";

const BENCH_PRESS_EXERCISE: Exercise = {
  amountUnit: "repetition",
  exerciseEquipment: [
    { equipment: "barbell" },
    { equipment: "bench" },
    { equipment: "rack" },
  ],
  exerciseMuscleGroups: [
    { muscleGroup: "chest", muscleGroupRole: "primary" },
    { muscleGroup: "triceps", muscleGroupRole: "secondary" },
  ],
  id: "019a0000-0000-7000-8000-000000000001",
  name: "Bench Press (Barbell)",
  weightType: "total",
};

const OVERHEAD_PRESS_EXERCISE: Exercise = {
  ...BENCH_PRESS_EXERCISE,
  exerciseEquipment: [{ equipment: "barbell" }, { equipment: "rack" }],
  exerciseMuscleGroups: [
    { muscleGroup: "front_deltoid", muscleGroupRole: "primary" },
    { muscleGroup: "triceps", muscleGroupRole: "secondary" },
  ],
  id: "019a0000-0000-7000-8000-000000000003",
  name: "Overhead Press (Barbell)",
};

describe("getExerciseSearchOptions", () => {
  it("returns each Equipment and each Muscle group of the Exercises once, in the order they first appear", () => {
    expect(
      getExerciseSearchOptions([OVERHEAD_PRESS_EXERCISE, BENCH_PRESS_EXERCISE]),
    ).toEqual({
      equipmentOptions: ["barbell", "rack", "bench"],
      muscleGroupOptions: ["front_deltoid", "triceps", "chest"],
    });
  });

  it("returns no option for no Exercise", () => {
    expect(getExerciseSearchOptions([])).toEqual({
      equipmentOptions: [],
      muscleGroupOptions: [],
    });
  });
});
