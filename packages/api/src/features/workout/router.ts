import type { DatabaseError } from "@ankaa/database/error";

import { workoutSaveInputSchema } from "@ankaa/core/features/workout/schemas/workout-save-input-schema";
import * as Match from "effect/Match";
import * as Schema from "effect/Schema";

import type { RoutineNotFoundError } from "./errors/routine-not-found-error.ts";
import type { WorkoutInProgressConflictError } from "./errors/workout-in-progress-conflict-error.ts";
import type { WorkoutNotFoundError } from "./errors/workout-not-found-error.ts";

import { protectedProcedure, router } from "../../trpc/procedures.ts";
import { run } from "../../trpc/run.ts";
import { saveWorkout } from "./interactors/save-workout.ts";

function getWorkoutErrorCode(
  error:
    | DatabaseError
    | RoutineNotFoundError
    | WorkoutInProgressConflictError
    | WorkoutNotFoundError,
) {
  return Match.valueTags(error, {
    DatabaseError: () => "INTERNAL_SERVER_ERROR" as const,
    RoutineNotFoundError: () => "NOT_FOUND" as const,
    WorkoutInProgressConflictError: () => "CONFLICT" as const,
    WorkoutNotFoundError: () => "NOT_FOUND" as const,
  });
}

export const workoutRouter = router({
  save: protectedProcedure
    .input(Schema.toStandardSchemaV1(workoutSaveInputSchema))
    .mutation(({ ctx, input, signal }) =>
      run({
        context: ctx,
        effect: saveWorkout(input),
        getErrorCode: getWorkoutErrorCode,
        signal,
      }),
    ),
});
