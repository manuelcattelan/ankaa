import { TRPCClientError } from "@trpc/client";

import { isWorkoutSaveErrorRetryable } from "@/features/workout/core/is-workout-save-error-retryable";
import { TrpcError } from "@/shared/errors/trpc-error";

describe("isWorkoutSaveErrorRetryable", () => {
  it("doesn't retry a Save that the server rejected as a bad request", () => {
    const trpcError = new TrpcError({
      cause: TRPCClientError.from({
        error: {
          code: -32_600,
          data: { code: "BAD_REQUEST", httpStatus: 400, path: "workout.save" },
          message: "Input validation failed",
        },
      }),
    });

    expect(isWorkoutSaveErrorRetryable(trpcError)).toBe(false);
  });

  it("doesn't retry a Save that the server rejected as a conflict", () => {
    const trpcError = new TrpcError({
      cause: TRPCClientError.from({
        error: {
          code: -32_009,
          data: { code: "CONFLICT", httpStatus: 409, path: "workout.save" },
          message: "CONFLICT",
        },
      }),
    });

    expect(isWorkoutSaveErrorRetryable(trpcError)).toBe(false);
  });

  it("doesn't retry a Save that the server rejected as not found", () => {
    const trpcError = new TrpcError({
      cause: TRPCClientError.from({
        error: {
          code: -32_004,
          data: { code: "NOT_FOUND", httpStatus: 404, path: "workout.save" },
          message: "NOT_FOUND",
        },
      }),
    });

    expect(isWorkoutSaveErrorRetryable(trpcError)).toBe(false);
  });

  it("retries a Save that failed with an internal server error", () => {
    const trpcError = new TrpcError({
      cause: TRPCClientError.from({
        error: {
          code: -32_603,
          data: {
            code: "INTERNAL_SERVER_ERROR",
            httpStatus: 500,
            path: "workout.save",
          },
          message: "Internal server error",
        },
      }),
    });

    expect(isWorkoutSaveErrorRetryable(trpcError)).toBe(true);
  });

  it("retries a Save that failed because the network failed", () => {
    const trpcError = new TrpcError({
      cause: TRPCClientError.from(new TypeError("Network request failed")),
    });

    expect(isWorkoutSaveErrorRetryable(trpcError)).toBe(true);
  });
});
