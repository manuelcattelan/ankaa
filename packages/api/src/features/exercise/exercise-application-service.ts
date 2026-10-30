import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { ExerciseRepository } from "#/features/exercise/exercise-repository.ts";

export class ExerciseApplicationService extends Context.Service<
  ExerciseApplicationService,
  { readonly list: ExerciseRepository["Service"]["list"] }
>()("@ankaa/api/features/exercise/ExerciseApplicationService") {
  static readonly layerNoDeps = Layer.effect(
    ExerciseApplicationService,
    Effect.gen(function* () {
      const exerciseRepository = yield* ExerciseRepository;

      const list = Effect.fn("ExerciseApplicationService.list")(function* () {
        return yield* exerciseRepository.list();
      });

      return ExerciseApplicationService.of({ list });
    }),
  );

  static readonly layer = ExerciseApplicationService.layerNoDeps.pipe(
    Layer.provide(ExerciseRepository.layer),
  );
}
