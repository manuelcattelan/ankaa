import { AbsenceDateConflictError } from "@ankaa/core/features/absence/errors/absence-date-conflict-error";
import { AbsenceDateInFutureError } from "@ankaa/core/features/absence/errors/absence-date-in-future-error";
import { RoutineNameConflictError } from "@ankaa/core/features/routine/errors/routine-name-conflict-error";
import { SegmentCountInvalidError } from "@ankaa/core/features/workout/errors/segment-count-invalid-error";
import { SegmentWeightNotAllowedError } from "@ankaa/core/features/workout/errors/segment-weight-not-allowed-error";
import { SetNotPlannedError } from "@ankaa/core/features/workout/errors/set-not-planned-error";
import { SkipConflictError } from "@ankaa/core/features/workout/errors/skip-conflict-error";
import { SkipReasonMissingError } from "@ankaa/core/features/workout/errors/skip-reason-missing-error";
import { WorkoutInProgressConflictError } from "@ankaa/core/features/workout/errors/workout-in-progress-conflict-error";
import { WorkoutNotFoundError } from "@ankaa/core/features/workout/errors/workout-not-found-error";
import { RoutineNotFoundError } from "@ankaa/core/shared/errors/routine-not-found-error";
import * as Schema from "effect/Schema";

export type WireError = typeof wireErrorSchema.Type;

/**
 * The union of every Wire error, which the error formatter encodes with.
 */
export const wireErrorSchema = Schema.Union([
  AbsenceDateConflictError,
  AbsenceDateInFutureError,
  RoutineNameConflictError,
  RoutineNotFoundError,
  SegmentCountInvalidError,
  SegmentWeightNotAllowedError,
  SetNotPlannedError,
  SkipConflictError,
  SkipReasonMissingError,
  WorkoutInProgressConflictError,
  WorkoutNotFoundError,
]);
