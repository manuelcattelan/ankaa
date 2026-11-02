import * as Schema from "effect/Schema";

import type { SetType } from "#/shared/constants/set-types.ts";

/**
 * Checks that a Routine exercise plans at least one Working set, because a
 * Warm-up set prepares for the Working sets of its own exercise, and a
 * Workout exercise records no more Sets than it plans.
 */
export const workingSetFilter = Schema.makeFilter(
  (routineExercise: { readonly sets: readonly { readonly type: SetType }[] }) =>
    routineExercise.sets.some((set) => set.type === "working"),
  { expected: "a planned Working set" },
);
