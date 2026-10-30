import { RoutineNameConflictError } from "@ankaa/core/features/routine/errors/routine-name-conflict-error";
import { RoutineNotFoundError } from "@ankaa/core/shared/errors/routine-not-found-error";
import { TRPCClientError } from "@trpc/client";

import { getRoutineSaveErrorMessage } from "#/features/routine/core/get-routine-save-error-message.ts";
import { TrpcClientError } from "#/shared/errors/trpc-client-error.ts";

describe("getRoutineSaveErrorMessage", () => {
  it("returns the message that the name is taken for a RoutineNameConflictError", () => {
    expect(getRoutineSaveErrorMessage(new RoutineNameConflictError())).toBe(
      "You already have a routine with this name: enter another name.",
    );
  });

  it("returns the message that the Routine doesn't exist anymore for a RoutineNotFoundError", () => {
    expect(getRoutineSaveErrorMessage(new RoutineNotFoundError())).toBe(
      "This routine doesn't exist anymore: go back to your routines.",
    );
  });

  it("returns the server unreachable message for a TrpcClientError caused by a network failure", () => {
    expect(
      getRoutineSaveErrorMessage(
        new TrpcClientError({
          cause: TRPCClientError.from(new TypeError("Network request failed")),
        }),
      ),
    ).toBe(
      "Ankaa can't connect: check your internet connection and try again.",
    );
  });
});
