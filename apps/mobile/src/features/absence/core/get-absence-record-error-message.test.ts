import { AbsenceDateConflictError } from "@ankaa/core/features/absence/errors/absence-date-conflict-error";
import { AbsenceDateInFutureError } from "@ankaa/core/features/absence/errors/absence-date-in-future-error";
import { RoutineNotFoundError } from "@ankaa/core/shared/errors/routine-not-found-error";
import { TRPCClientError } from "@trpc/client";

import { getAbsenceRecordErrorMessage } from "#/features/absence/core/get-absence-record-error-message.ts";
import { TrpcClientError } from "#/shared/errors/trpc-client-error.ts";

describe("getAbsenceRecordErrorMessage", () => {
  it("returns the message that an Absence is already recorded for an AbsenceDateConflictError", () => {
    expect(getAbsenceRecordErrorMessage(new AbsenceDateConflictError())).toBe(
      "You already recorded that you couldn't do this routine on this day.",
    );
  });

  it("returns the message that the day hasn't come yet for an AbsenceDateInFutureError", () => {
    expect(getAbsenceRecordErrorMessage(new AbsenceDateInFutureError())).toBe(
      "This day hasn't come yet where you are: pick today or a day before it.",
    );
  });

  it("returns the message that the Routine doesn't exist anymore for a RoutineNotFoundError", () => {
    expect(getAbsenceRecordErrorMessage(new RoutineNotFoundError())).toBe(
      "This routine doesn't exist anymore: pick another routine.",
    );
  });

  it("returns the server unreachable message for a TrpcClientError caused by a network failure", () => {
    expect(
      getAbsenceRecordErrorMessage(
        new TrpcClientError({
          cause: TRPCClientError.from(new TypeError("Network request failed")),
        }),
      ),
    ).toBe(
      "Ankaa can't connect: check your internet connection and try again.",
    );
  });
});
