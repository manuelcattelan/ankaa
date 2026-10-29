import * as PgClient from "@effect/sql-pg/PgClient";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { Database } from "./index.ts";
import {
  exercise,
  exerciseEquipment,
  exerciseMuscleGroup,
} from "./schema/exercise.ts";

type ExerciseSeed = Pick<
  typeof exercise.$inferSelect,
  "amountUnit" | "id" | "name" | "weightType"
> & {
  equipment: Pick<typeof exerciseEquipment.$inferSelect, "equipment">[];
  muscleGroups: Pick<
    typeof exerciseMuscleGroup.$inferSelect,
    "muscleGroup" | "role"
  >[];
};

const EXERCISE_SEEDS: ExerciseSeed[] = [
  {
    amountUnit: "repetition",
    equipment: [
      { equipment: "barbell" },
      { equipment: "bench" },
      { equipment: "rack" },
    ],
    id: "01a116a3-0b0f-70ce-91c2-03ac50a49f4b",
    muscleGroups: [
      { muscleGroup: "chest", role: "primary" },
      { muscleGroup: "triceps", role: "secondary" },
      { muscleGroup: "front_deltoid", role: "secondary" },
    ],
    name: "Bench Press (Barbell)",
    weightType: "total",
  },
];

const databaseLayer = Database.layerNoDeps.pipe(
  Layer.provide(
    PgClient.layerConfig({ url: Config.Redacted("DATABASE_URL_DIRECT") }),
  ),
);

await Effect.runPromise(
  Effect.gen(function* () {
    const database = yield* Database;

    yield* database.transaction((tx) =>
      Effect.gen(function* () {
        for (const exerciseSeed of EXERCISE_SEEDS) {
          yield* tx
            .insert(exercise)
            .values({
              amountUnit: exerciseSeed.amountUnit,
              id: exerciseSeed.id,
              name: exerciseSeed.name,
              weightType: exerciseSeed.weightType,
            })
            .onConflictDoUpdate({
              set: {
                amountUnit: exerciseSeed.amountUnit,
                name: exerciseSeed.name,
                weightType: exerciseSeed.weightType,
              },
              target: exercise.id,
            });

          for (const exerciseMuscleGroupSeed of exerciseSeed.muscleGroups) {
            yield* tx
              .insert(exerciseMuscleGroup)
              .values({
                ...exerciseMuscleGroupSeed,
                exerciseId: exerciseSeed.id,
              })
              .onConflictDoUpdate({
                set: { role: exerciseMuscleGroupSeed.role },
                target: [
                  exerciseMuscleGroup.exerciseId,
                  exerciseMuscleGroup.muscleGroup,
                ],
              });
          }

          for (const exerciseEquipmentSeed of exerciseSeed.equipment) {
            yield* tx
              .insert(exerciseEquipment)
              .values({ ...exerciseEquipmentSeed, exerciseId: exerciseSeed.id })
              .onConflictDoNothing();
          }
        }
      }),
    );
  }).pipe(Effect.provide(databaseLayer)),
);
