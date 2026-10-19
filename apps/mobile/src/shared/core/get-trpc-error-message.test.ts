import { TRPCClientError } from "@trpc/client";

import { getTrpcErrorMessage } from "@/shared/core/get-trpc-error-message";
import { TrpcError } from "@/shared/errors/trpc-error";

const NOT_FOUND_TRPC_ERROR_RESPONSE = {
  error: {
    code: -32_004,
    data: { code: "NOT_FOUND", httpStatus: 404, path: "routine.delete" },
    message: "Routine not found",
  },
};

describe("getTrpcErrorMessage", () => {
  it("returns the unknown error message for a TrpcError caused by an error that the server sent", () => {
    const trpcError = new TrpcError({
      cause: TRPCClientError.from(NOT_FOUND_TRPC_ERROR_RESPONSE),
    });

    expect(getTrpcErrorMessage(trpcError)).toBe(
      "Something went wrong: try again.",
    );
  });

  it("returns the server unreachable message for a TrpcError caused by a network failure", () => {
    const trpcError = new TrpcError({
      cause: TRPCClientError.from(new TypeError("Network request failed")),
    });

    expect(getTrpcErrorMessage(trpcError)).toBe(
      "The server can't be reached: check your connection and try again.",
    );
  });

  it("returns the unknown error message for an error that the server sent without a TrpcError around it", () => {
    expect(
      getTrpcErrorMessage(TRPCClientError.from(NOT_FOUND_TRPC_ERROR_RESPONSE)),
    ).toBe("Something went wrong: try again.");
  });

  it("returns the server unreachable message for an error that isn't from tRPC", () => {
    expect(getTrpcErrorMessage(new TypeError("Network request failed"))).toBe(
      "The server can't be reached: check your connection and try again.",
    );
  });
});
