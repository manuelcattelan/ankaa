import { RoutineNotFoundError } from "@ankaa/core/shared/errors/routine-not-found-error";
import { TRPCClientError } from "@trpc/client";

import { getRoutineDeleteErrorMessage } from "#/features/routine/core/get-routine-delete-error-message.ts";
import { TrpcClientError } from "#/shared/errors/trpc-client-error.ts";

describe("getRoutineDeleteErrorMessage", () => {
  it("returns the message that the Routine doesn't exist anymore for a RoutineNotFoundError", () => {
    expect(getRoutineDeleteErrorMessage(new RoutineNotFoundError())).toBe(
      "This routine doesn't exist anymore: go back to your routines.",
    );
  });

  it("returns the server unreachable message for a TrpcClientError caused by a network failure", () => {
    expect(
      getRoutineDeleteErrorMessage(
        new TrpcClientError({
          cause: TRPCClientError.from(new TypeError("Network request failed")),
        }),
      ),
    ).toBe(
      "Ankaa can't connect: check your internet connection and try again.",
    );
  });
});
