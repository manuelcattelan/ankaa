import { getTrpcErrorCode } from "@/shared/core/get-trpc-error-code";

const WORKOUT_SAVE_PERMANENT_ERROR_CODES = [
  "BAD_REQUEST",
  "CONFLICT",
  "NOT_FOUND",
];

export function isWorkoutSaveErrorRetryable(error: unknown) {
  const trpcErrorCode = getTrpcErrorCode(error);

  return (
    trpcErrorCode === undefined ||
    !WORKOUT_SAVE_PERMANENT_ERROR_CODES.includes(trpcErrorCode)
  );
}
