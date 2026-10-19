import { TRPCClientError } from "@trpc/client";

import { getRoutineSaveErrorMessage } from "@/features/routine/core/get-routine-save-error-message";
import { TrpcError } from "@/shared/errors/trpc-error";

const CONFLICT_TRPC_ERROR_RESPONSE = {
  error: {
    code: -32_009,
    data: { code: "CONFLICT", httpStatus: 409, path: "routine.save" },
    message: "CONFLICT",
  },
};

const NOT_FOUND_TRPC_ERROR_RESPONSE = {
  error: {
    code: -32_004,
    data: { code: "NOT_FOUND", httpStatus: 404, path: "routine.save" },
    message: "NOT_FOUND",
  },
};

describe("getRoutineSaveErrorMessage", () => {
  it("returns the name taken message for a conflict that the server sent", () => {
    const trpcError = new TrpcError({
      cause: TRPCClientError.from(CONFLICT_TRPC_ERROR_RESPONSE),
    });

    expect(getRoutineSaveErrorMessage(trpcError)).toBe(
      "You already have a routine with this name: enter another name.",
    );
  });

  it("returns the unknown error message for another error that the server sent", () => {
    const trpcError = new TrpcError({
      cause: TRPCClientError.from(NOT_FOUND_TRPC_ERROR_RESPONSE),
    });

    expect(getRoutineSaveErrorMessage(trpcError)).toBe(
      "Something went wrong: try again.",
    );
  });

  it("returns the server unreachable message for a network failure", () => {
    const trpcError = new TrpcError({
      cause: TRPCClientError.from(new TypeError("Network request failed")),
    });

    expect(getRoutineSaveErrorMessage(trpcError)).toBe(
      "The server can't be reached: check your connection and try again.",
    );
  });
});
