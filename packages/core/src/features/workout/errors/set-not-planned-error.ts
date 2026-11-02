import * as Schema from "effect/Schema";

/**
 * The Wire error of a Set past the last planned Set of its Workout exercise,
 * which has no matching planned Set, since a Workout exercise records no
 * more Sets than it plans.
 */
export class SetNotPlannedError extends Schema.TaggedError<SetNotPlannedError>()(
  "SetNotPlannedError",
  {},
) {}
