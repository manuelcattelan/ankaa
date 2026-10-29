import { TRPCClientError } from "@trpc/client";

import { isTrpcCallUnauthorized } from "#/shared/core/is-trpc-call-unauthorized.ts";

describe("isTrpcCallUnauthorized", () => {
  it("returns true for a tRPC call that the server rejected with UNAUTHORIZED", () => {
    expect(
      isTrpcCallUnauthorized(
        TRPCClientError.from({
          error: {
            code: -32_001,
            data: {
              code: "UNAUTHORIZED",
              httpStatus: 401,
              path: "routine.list",
              wireError: null,
            },
            message: "UNAUTHORIZED",
          },
        }),
      ),
    ).toBe(true);
  });

  it("returns false for a tRPC call that the server rejected with another code", () => {
    expect(
      isTrpcCallUnauthorized(
        TRPCClientError.from({
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
        }),
      ),
    ).toBe(false);
  });

  it("returns false for a tRPC call that couldn't reach the server", () => {
    expect(
      isTrpcCallUnauthorized(
        TRPCClientError.from(new TypeError("Network request failed")),
      ),
    ).toBe(false);
  });
});
