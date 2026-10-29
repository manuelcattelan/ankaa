import { WorkoutInProgressConflictError } from "@ankaa/core/features/workout/errors/workout-in-progress-conflict-error";
import { RoutineNotFoundError } from "@ankaa/core/shared/errors/routine-not-found-error";

import { getWorkoutStartErrorMessage } from "#/features/workout/core/get-workout-start-error-message.ts";
import { TrpcClientError } from "#/shared/errors/trpc-client-error.ts";

describe("getWorkoutStartErrorMessage", () => {
  it("tells the User that the Routine doesn't exist anymore for RoutineNotFoundError", () => {
    expect(getWorkoutStartErrorMessage(new RoutineNotFoundError())).toBe(
      "This routine doesn't exist anymore: start another routine.",
    );
  });

  it("tells the User that a Workout is already in progress for WorkoutInProgressConflictError", () => {
    expect(
      getWorkoutStartErrorMessage(new WorkoutInProgressConflictError()),
    ).toBe(
      "You already have a workout in progress: resume it, or stop it before you start another.",
    );
  });

  it("tells the User that Ankaa can't connect when the server can't be reached", () => {
    expect(
      getWorkoutStartErrorMessage(
        new TrpcClientError({ cause: new TypeError("Network request failed") }),
      ),
    ).toBe(
      "Ankaa can't connect: check your internet connection and try again.",
    );
  });
});
