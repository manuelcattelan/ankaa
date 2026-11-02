import { SkipReasonMissingError } from "@ankaa/core/features/workout/errors/skip-reason-missing-error";
import { WorkoutNotFoundError } from "@ankaa/core/features/workout/errors/workout-not-found-error";

import { getWorkoutStopErrorMessage } from "#/features/workout/core/get-workout-stop-error-message.ts";
import { TrpcClientError } from "#/shared/errors/trpc-client-error.ts";

describe("getWorkoutStopErrorMessage", () => {
  it("tells the User to pick why they're stopping early for SkipReasonMissingError", () => {
    expect(getWorkoutStopErrorMessage(new SkipReasonMissingError())).toBe(
      "Some exercises aren't done: pick why you're stopping early, then stop the workout again.",
    );
  });

  it("tells the User that the Workout isn't in progress anymore for WorkoutNotFoundError", () => {
    expect(getWorkoutStopErrorMessage(new WorkoutNotFoundError())).toBe(
      "This workout isn't in progress anymore: go back to the home screen.",
    );
  });

  it("tells the User that Ankaa can't connect when the server can't be reached", () => {
    expect(
      getWorkoutStopErrorMessage(
        new TrpcClientError({ cause: new TypeError("Network request failed") }),
      ),
    ).toBe(
      "Ankaa can't connect: check your internet connection and try again.",
    );
  });
});
