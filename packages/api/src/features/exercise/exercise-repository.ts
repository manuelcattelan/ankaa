import type {
  exercise,
  exerciseEquipment,
  exerciseMuscleGroup,
} from "@ankaa/database/schema/exercise";

import { Database } from "@ankaa/database";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

type ExerciseRepositoryShape = {
  readonly list: () => Effect.Effect<ListedExercise[]>;
};

type ListedExercise = Pick<
  typeof exercise.$inferSelect,
  "amountUnit" | "id" | "name" | "weightType"
> & {
  exerciseEquipment: Pick<typeof exerciseEquipment.$inferSelect, "equipment">[];
  exerciseMuscleGroups: Pick<
    typeof exerciseMuscleGroup.$inferSelect,
    "muscleGroup" | "muscleGroupRole"
  >[];
};

export class ExerciseRepository extends Context.Service<
  ExerciseRepository,
  ExerciseRepositoryShape
>()("@ankaa/api/features/exercise/ExerciseRepository") {
  static readonly layerNoDeps = Layer.effect(
    ExerciseRepository,
    Effect.gen(function* () {
      const database = yield* Database;

      const list = Effect.fn("ExerciseRepository.list")(function* () {
        return yield* database.query.exercise
          .findMany({
            columns: {
              amountUnit: true,
              id: true,
              name: true,
              weightType: true,
            },
            orderBy: { name: "asc" },
            with: {
              exerciseEquipment: {
                columns: { equipment: true },
                orderBy: { equipment: "asc" },
              },
              exerciseMuscleGroups: {
                columns: { muscleGroup: true, muscleGroupRole: true },
                orderBy: { muscleGroup: "asc" },
              },
            },
          })
          .pipe(Effect.orDie);
      });

      return ExerciseRepository.of({ list });
    }),
  );

  static readonly layer = ExerciseRepository.layerNoDeps.pipe(
    Layer.provide(Database.layer),
  );
}
