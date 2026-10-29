import type { RoutineNotFoundError } from "@ankaa/core/shared/errors/routine-not-found-error";

import { Database } from "@ankaa/database/database";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Match from "effect/Match";

import { decideRoutineDelete } from "#/features/routine/core/decide-routine-delete.ts";
import { RoutineRepository } from "#/features/routine/routine-repository.ts";

export class RoutineApplicationService extends Context.Service<
  RoutineApplicationService,
  {
    readonly delete: (options: {
      id: string;
      userId: string;
    }) => Effect.Effect<void, RoutineNotFoundError>;
    readonly list: RoutineRepository["Service"]["list"];
  }
>()("@ankaa/api/features/routine/RoutineApplicationService") {
  static readonly layerNoDeps = Layer.effect(
    RoutineApplicationService,
    Effect.gen(function* () {
      const database = yield* Database;
      const routineRepository = yield* RoutineRepository;

      const deleteRoutine = Effect.fn("RoutineApplicationService.delete")(
        function* ({ id, userId }: { id: string; userId: string }) {
          yield* database
            .transaction(() =>
              Effect.gen(function* () {
                const routine = yield* routineRepository.findForUpdate({ id });

                yield* Match.valueTags(
                  decideRoutineDelete({ routine, userId }),
                  {
                    RoutineAlreadyDeleted: () => Effect.void,
                    RoutineDeleteAllowed: () =>
                      routineRepository.delete({ id }),
                    RoutineNotFoundError: (error) => Effect.fail(error),
                  },
                );
              }),
            )
            .pipe(Effect.catchTag("SqlError", (error) => Effect.die(error)));
        },
      );

      const list = Effect.fn("RoutineApplicationService.list")(function* ({
        userId,
      }: {
        userId: string;
      }) {
        return yield* routineRepository.list({ userId });
      });

      return RoutineApplicationService.of({ delete: deleteRoutine, list });
    }),
  );

  static readonly layer = RoutineApplicationService.layerNoDeps.pipe(
    Layer.provide([Database.layer, RoutineRepository.layer]),
  );
}
