import { RoutineNameConflictError } from "@ankaa/core/features/routine/errors/routine-name-conflict-error";
import { SegmentCountInvalidError } from "@ankaa/core/features/workout/errors/segment-count-invalid-error";
import { SegmentWeightNotAllowedError } from "@ankaa/core/features/workout/errors/segment-weight-not-allowed-error";
import { WorkoutInProgressConflictError } from "@ankaa/core/features/workout/errors/workout-in-progress-conflict-error";
import { WorkoutNotFoundError } from "@ankaa/core/features/workout/errors/workout-not-found-error";
import { RoutineNotFoundError } from "@ankaa/core/shared/errors/routine-not-found-error";
import * as Schema from "effect/Schema";

export type WireError = typeof wireErrorSchema.Type;

/**
 * The union of every Wire error, which the error formatter encodes with.
 */
export const wireErrorSchema = Schema.Union([
  RoutineNameConflictError,
  RoutineNotFoundError,
  SegmentCountInvalidError,
  SegmentWeightNotAllowedError,
  WorkoutInProgressConflictError,
  WorkoutNotFoundError,
]);
