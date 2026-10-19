import { TRPCClientError } from "@trpc/client";

import { getTrpcErrorCode } from "@/shared/core/get-trpc-error-code";
import { TrpcError } from "@/shared/errors/trpc-error";

const CONFLICT_TRPC_ERROR_RESPONSE = {
  error: {
    code: -32_009,
    data: { code: "CONFLICT", httpStatus: 409, path: "workout.save" },
    message: "This Workout was saved with another Routine",
  },
};

describe("getTrpcErrorCode", () => {
  it("returns the code of a TrpcError caused by an error that the server sent", () => {
    const trpcError = new TrpcError({
      cause: TRPCClientError.from(CONFLICT_TRPC_ERROR_RESPONSE),
    });

    expect(getTrpcErrorCode(trpcError)).toBe("CONFLICT");
  });

  it("returns no code for a TrpcError caused by a network failure", () => {
    const trpcError = new TrpcError({
      cause: TRPCClientError.from(new TypeError("Network request failed")),
    });

    expect(getTrpcErrorCode(trpcError)).toBe(undefined);
  });

  it("returns no code for a TrpcError caused by an error that isn't from tRPC", () => {
    const trpcError = new TrpcError({ cause: { data: { code: "CONFLICT" } } });

    expect(getTrpcErrorCode(trpcError)).toBe(undefined);
  });

  it("returns no code for an error that the server sent but isn't wrapped in a TrpcError", () => {
    expect(
      getTrpcErrorCode(TRPCClientError.from(CONFLICT_TRPC_ERROR_RESPONSE)),
    ).toBe(undefined);
  });
});
