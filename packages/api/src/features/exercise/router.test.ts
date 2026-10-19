import { Database } from "@ankaa/database";
import {
  exercise,
  exerciseEquipment,
  exerciseMuscleGroup,
} from "@ankaa/database/schema/exercise";
import { createTestRuntime } from "@ankaa/vitest/create-test-runtime";
import { afterAll, describe, expect, it } from "@effect/vitest";

import { createCaller } from "../../shared/testing/create-caller.ts";
import { createSignedInCaller } from "../../shared/testing/create-signed-in-caller.ts";
import { createInnerContext } from "../../trpc/context.ts";

describe("exercise.list", () => {
  const runtime = createTestRuntime();

  afterAll(async () => {
    await runtime.dispose();
  });

  it("fails with UNAUTHORIZED without a session", async () => {
    const caller = createCaller(createInnerContext({ runtime, session: null }));

    await expect(caller.exercise.list()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("returns every Exercise with its Equipment and Muscle groups, ordered by name, to a signed-in person", async () => {
    await runtime.runPromise(
      Database.use((database) =>
        database.transaction(async (transaction) => {
          await transaction.insert(exercise).values([
            {
              amountUnit: "repetition",
              id: "019a0000-0000-7000-8000-000000000001",
              name: "Push-Up",
              weightType: "bodyweight",
            },
            {
              amountUnit: "repetition",
              id: "019a0000-0000-7000-8000-000000000002",
              name: "Bench Press (Barbell)",
              weightType: "total",
            },
          ]);

          await transaction.insert(exerciseEquipment).values([
            {
              equipment: "rack",
              exerciseId: "019a0000-0000-7000-8000-000000000002",
            },
            {
              equipment: "barbell",
              exerciseId: "019a0000-0000-7000-8000-000000000002",
            },
            {
              equipment: "bench",
              exerciseId: "019a0000-0000-7000-8000-000000000002",
            },
          ]);

          await transaction.insert(exerciseMuscleGroup).values([
            {
              exerciseId: "019a0000-0000-7000-8000-000000000001",
              muscleGroup: "triceps",
              muscleGroupRole: "secondary",
            },
            {
              exerciseId: "019a0000-0000-7000-8000-000000000001",
              muscleGroup: "chest",
              muscleGroupRole: "primary",
            },
            {
              exerciseId: "019a0000-0000-7000-8000-000000000002",
              muscleGroup: "front_deltoid",
              muscleGroupRole: "secondary",
            },
            {
              exerciseId: "019a0000-0000-7000-8000-000000000002",
              muscleGroup: "chest",
              muscleGroupRole: "primary",
            },
          ]);
        }),
      ),
    );

    const caller = await createSignedInCaller(runtime);

    const exercises = await caller.exercise.list();

    expect(exercises).toStrictEqual([
      {
        amountUnit: "repetition",
        exerciseEquipment: [
          { equipment: "barbell" },
          { equipment: "bench" },
          { equipment: "rack" },
        ],
        exerciseMuscleGroups: [
          { muscleGroup: "chest", muscleGroupRole: "primary" },
          { muscleGroup: "front_deltoid", muscleGroupRole: "secondary" },
        ],
        id: "019a0000-0000-7000-8000-000000000002",
        name: "Bench Press (Barbell)",
        weightType: "total",
      },
      {
        amountUnit: "repetition",
        exerciseEquipment: [],
        exerciseMuscleGroups: [
          { muscleGroup: "chest", muscleGroupRole: "primary" },
          { muscleGroup: "triceps", muscleGroupRole: "secondary" },
        ],
        id: "019a0000-0000-7000-8000-000000000001",
        name: "Push-Up",
        weightType: "bodyweight",
      },
    ]);
  });
});
