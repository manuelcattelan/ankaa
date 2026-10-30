import type { WorkoutSaveNoteInput } from "@ankaa/core/features/workout/schemas/workout-save-note-input-schema";

import { mutationOptions } from "@tanstack/react-query";
import * as Effect from "effect/Effect";

import type { ApplicationRuntime } from "#/layer.ts";

import { WorkoutApplicationService } from "#/features/workout/workout-application-service.ts";

const program = Effect.fn("workoutSaveNoteMutation")(function* (
  input: WorkoutSaveNoteInput,
) {
  const workoutApplicationService = yield* WorkoutApplicationService;

  return yield* workoutApplicationService.saveNote(input);
});

export function workoutSaveNoteMutationOptions(runtime: ApplicationRuntime) {
  return mutationOptions<
    Effect.Success<ReturnType<typeof program>>,
    Effect.Error<ReturnType<typeof program>>,
    WorkoutSaveNoteInput
  >({
    mutationFn: (input) => runtime.runPromise(program(input)),
  });
}
