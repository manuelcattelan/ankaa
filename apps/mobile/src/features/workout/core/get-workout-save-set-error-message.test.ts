import { SegmentCountInvalidError } from "@ankaa/core/features/workout/errors/segment-count-invalid-error";
import { SegmentWeightNotAllowedError } from "@ankaa/core/features/workout/errors/segment-weight-not-allowed-error";
import { WorkoutNotFoundError } from "@ankaa/core/features/workout/errors/workout-not-found-error";

import { getWorkoutSaveSetErrorMessage } from "#/features/workout/core/get-workout-save-set-error-message.ts";
import { TrpcClientError } from "#/shared/errors/trpc-client-error.ts";

describe("getWorkoutSaveSetErrorMessage", () => {
  it("tells the User to remove a Segment for SegmentCountInvalidError", () => {
    expect(getWorkoutSaveSetErrorMessage(new SegmentCountInvalidError())).toBe(
      "This set has more segments than planned: remove a segment and save the set again.",
    );
  });

  it("tells the User to clear the weight for SegmentWeightNotAllowedError", () => {
    expect(
      getWorkoutSaveSetErrorMessage(new SegmentWeightNotAllowedError()),
    ).toBe(
      "This exercise takes no weight: clear the weight and save the set again.",
    );
  });

  it("tells the User that the Workout isn't in progress anymore for WorkoutNotFoundError", () => {
    expect(getWorkoutSaveSetErrorMessage(new WorkoutNotFoundError())).toBe(
      "This workout isn't in progress anymore: go back to the home screen.",
    );
  });

  it("tells the User that Ankaa can't connect when the server can't be reached", () => {
    expect(
      getWorkoutSaveSetErrorMessage(
        new TrpcClientError({ cause: new TypeError("Network request failed") }),
      ),
    ).toBe(
      "Ankaa can't connect: check your internet connection and try again.",
    );
  });
});
