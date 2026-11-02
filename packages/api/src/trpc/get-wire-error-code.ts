import * as Match from "effect/Match";

import type { WireError } from "#/trpc/wire-error-schema.ts";

export function getWireErrorCode(wireError: WireError) {
  return Match.valueTags(wireError, {
    AbsenceDateConflictError: () => "CONFLICT" as const,
    AbsenceDateInFutureError: () => "UNPROCESSABLE_CONTENT" as const,
    RoutineNameConflictError: () => "CONFLICT" as const,
    RoutineNotFoundError: () => "NOT_FOUND" as const,
    SegmentCountInvalidError: () => "UNPROCESSABLE_CONTENT" as const,
    SegmentWeightNotAllowedError: () => "UNPROCESSABLE_CONTENT" as const,
    SetNotPlannedError: () => "UNPROCESSABLE_CONTENT" as const,
    SkipConflictError: () => "CONFLICT" as const,
    SkipReasonMissingError: () => "UNPROCESSABLE_CONTENT" as const,
    WorkoutInProgressConflictError: () => "CONFLICT" as const,
    WorkoutNotFoundError: () => "NOT_FOUND" as const,
  });
}
