import { WorkoutNotFoundError } from "@ankaa/core/features/workout/errors/workout-not-found-error";

import { getWorkoutRemoveSetErrorMessage } from "#/features/workout/core/get-workout-remove-set-error-message.ts";
import { TrpcClientError } from "#/shared/errors/trpc-client-error.ts";

describe("getWorkoutRemoveSetErrorMessage", () => {
  it("tells the User that the Workout isn't in progress anymore for WorkoutNotFoundError", () => {
    expect(getWorkoutRemoveSetErrorMessage(new WorkoutNotFoundError())).toBe(
      "This workout isn't in progress anymore: go back to the home screen.",
    );
  });

  it("tells the User that Ankaa can't connect when the server can't be reached", () => {
    expect(
      getWorkoutRemoveSetErrorMessage(
        new TrpcClientError({ cause: new TypeError("Network request failed") }),
      ),
    ).toBe(
      "Ankaa can't connect: check your internet connection and try again.",
    );
  });
});
