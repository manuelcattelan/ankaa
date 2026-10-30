import { RoutineNotFoundError } from "@ankaa/core/shared/errors/routine-not-found-error";
import { TRPCClientError } from "@trpc/client";

import { getTrpcRequestError } from "#/shared/core/get-trpc-request-error.ts";
import { TrpcClientError } from "#/shared/errors/trpc-client-error.ts";

const ROUTINE_NOT_FOUND_TRPC_ERROR_RESPONSE = {
  error: {
    code: -32_004,
    data: {
      code: "NOT_FOUND",
      httpStatus: 404,
      path: "routine.delete",
      wireError: { _tag: "RoutineNotFoundError" },
    },
    message: "NOT_FOUND",
  },
};

describe("getTrpcRequestError", () => {
  it("decodes the Wire error that the server encoded, when the procedure's list has it", () => {
    expect(
      getTrpcRequestError({
        cause: TRPCClientError.from(ROUTINE_NOT_FOUND_TRPC_ERROR_RESPONSE),
        errors: [RoutineNotFoundError],
      }),
    ).toStrictEqual(new RoutineNotFoundError());
  });

  it("returns a TrpcClientError caused by the failure when the procedure's list doesn't have the Wire error", () => {
    const cause = TRPCClientError.from(ROUTINE_NOT_FOUND_TRPC_ERROR_RESPONSE);

    expect(getTrpcRequestError({ cause, errors: [] })).toStrictEqual(
      new TrpcClientError({ cause }),
    );
  });

  it("returns a TrpcClientError caused by the failure when the server can't be reached", () => {
    const cause = TRPCClientError.from(new TypeError("Network request failed"));

    expect(
      getTrpcRequestError({ cause, errors: [RoutineNotFoundError] }),
    ).toStrictEqual(new TrpcClientError({ cause }));
  });
});
