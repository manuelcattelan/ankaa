import type { RoutineDeleteInput } from "@ankaa/core/features/routine/schemas/routine-delete-input-schema";

import { CurrentSession } from "@ankaa/authentication/current-session";
import { Database } from "@ankaa/database";
import * as Effect from "effect/Effect";
import * as Match from "effect/Match";

import { RoutineNotFoundError } from "../../../shared/errors/routine-not-found-error.ts";
import { decideRoutineDelete } from "../core/decide-routine-delete.ts";
import { findRoutine } from "../queries/find-routine.ts";
import { updateRoutineDeletedAt } from "../queries/update-routine-deleted-at.ts";

export const deleteRoutine = Effect.fn("deleteRoutine")(function* (
  routineDeleteInput: RoutineDeleteInput,
) {
  const database = yield* Database;
  const currentSession = yield* CurrentSession;

  return yield* database
    .transaction(async (transaction) => {
      const routine = await findRoutine({
        database: transaction,
        routineId: routineDeleteInput.id,
        userId: currentSession.user.id,
      });

      const routineDeleteOutcome = decideRoutineDelete({ routine });

      await Match.valueTags(routineDeleteOutcome, {
        RoutineDeleteAllowed: () =>
          updateRoutineDeletedAt({
            database: transaction,
            routineId: routineDeleteInput.id,
          }),
        RoutineNotFound: () => Promise.resolve(),
      });

      return routineDeleteOutcome;
    })
    .pipe(
      Effect.flatMap((routineDeleteOutcome) =>
        Match.valueTags(routineDeleteOutcome, {
          RoutineDeleteAllowed: () => Effect.void,
          RoutineNotFound: () => Effect.fail(new RoutineNotFoundError()),
        }),
      ),
    );
});
