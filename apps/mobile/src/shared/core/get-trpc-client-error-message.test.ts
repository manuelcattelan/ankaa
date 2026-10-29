import { TRPCClientError } from "@trpc/client";

import { getTrpcClientErrorMessage } from "#/shared/core/get-trpc-client-error-message.ts";
import { TrpcClientError } from "#/shared/errors/trpc-client-error.ts";

const NOT_FOUND_TRPC_ERROR_RESPONSE = {
  error: {
    code: -32_004,
    data: { code: "NOT_FOUND", httpStatus: 404, path: "routine.delete" },
    message: "Routine not found",
  },
};

describe("getTrpcClientErrorMessage", () => {
  it("returns the unknown error message for a TrpcClientError caused by an error that the server sent", () => {
    const trpcClientError = new TrpcClientError({
      cause: TRPCClientError.from(NOT_FOUND_TRPC_ERROR_RESPONSE),
    });

    expect(getTrpcClientErrorMessage(trpcClientError)).toBe(
      "Something went wrong: try again.",
    );
  });

  it("returns the server unreachable message for a TrpcClientError caused by a network failure", () => {
    const trpcClientError = new TrpcClientError({
      cause: TRPCClientError.from(new TypeError("Network request failed")),
    });

    expect(getTrpcClientErrorMessage(trpcClientError)).toBe(
      "Ankaa can't connect: check your internet connection and try again.",
    );
  });

  it("returns the unknown error message for an error that the server sent without a TrpcClientError around it", () => {
    expect(
      getTrpcClientErrorMessage(
        TRPCClientError.from(NOT_FOUND_TRPC_ERROR_RESPONSE),
      ),
    ).toBe("Something went wrong: try again.");
  });

  it("returns the server unreachable message for an error that isn't from tRPC", () => {
    expect(
      getTrpcClientErrorMessage(new TypeError("Network request failed")),
    ).toBe(
      "Ankaa can't connect: check your internet connection and try again.",
    );
  });
});
