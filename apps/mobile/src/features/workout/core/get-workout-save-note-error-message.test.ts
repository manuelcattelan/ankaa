import { WorkoutNotFoundError } from "@ankaa/core/features/workout/errors/workout-not-found-error";

import { getWorkoutSaveNoteErrorMessage } from "#/features/workout/core/get-workout-save-note-error-message.ts";
import { TrpcClientError } from "#/shared/errors/trpc-client-error.ts";

describe("getWorkoutSaveNoteErrorMessage", () => {
  it("tells the User that the Workout isn't in progress anymore for WorkoutNotFoundError", () => {
    expect(getWorkoutSaveNoteErrorMessage(new WorkoutNotFoundError())).toBe(
      "This workout isn't in progress anymore: go back to the home screen.",
    );
  });

  it("tells the User that Ankaa can't connect when the server can't be reached", () => {
    expect(
      getWorkoutSaveNoteErrorMessage(
        new TrpcClientError({ cause: new TypeError("Network request failed") }),
      ),
    ).toBe(
      "Ankaa can't connect: check your internet connection and try again.",
    );
  });
});
