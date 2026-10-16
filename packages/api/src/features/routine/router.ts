import type { DatabaseError } from "@ankaa/database/error";

import { routineDeleteInputSchema } from "@ankaa/core/features/routine/schemas/routine-delete-input-schema";
import { routineSaveInputSchema } from "@ankaa/core/features/routine/schemas/routine-save-input-schema";
import * as Match from "effect/Match";
import * as Schema from "effect/Schema";

import type { RoutineNameConflictError } from "./errors/routine-name-conflict-error.ts";
import type { RoutineNotFoundError } from "./errors/routine-not-found-error.ts";

import { protectedProcedure, router } from "../../trpc/procedures.ts";
import { run } from "../../trpc/run.ts";
import { deleteRoutine } from "./interactors/delete-routine.ts";
import { listRoutines } from "./interactors/list-routines.ts";
import { saveRoutine } from "./interactors/save-routine.ts";

function getRoutineErrorCode(
  error: DatabaseError | RoutineNameConflictError | RoutineNotFoundError,
) {
  return Match.valueTags(error, {
    DatabaseError: () => "INTERNAL_SERVER_ERROR" as const,
    RoutineNameConflictError: () => "CONFLICT" as const,
    RoutineNotFoundError: () => "NOT_FOUND" as const,
  });
}

export const routineRouter = router({
  delete: protectedProcedure
    .input(Schema.toStandardSchemaV1(routineDeleteInputSchema))
    .mutation(({ ctx, input, signal }) =>
      run({
        context: ctx,
        effect: deleteRoutine(input),
        getErrorCode: getRoutineErrorCode,
        signal,
      }),
    ),
  list: protectedProcedure.query(({ ctx, signal }) =>
    run({
      context: ctx,
      effect: listRoutines(),
      getErrorCode: getRoutineErrorCode,
      signal,
    }),
  ),
  save: protectedProcedure
    .input(Schema.toStandardSchemaV1(routineSaveInputSchema))
    .mutation(({ ctx, input, signal }) =>
      run({
        context: ctx,
        effect: saveRoutine(input),
        getErrorCode: getRoutineErrorCode,
        signal,
      }),
    ),
});
