import * as Schema from "effect/Schema";
import { describe, expect, it } from "vitest";

import { exerciseGroupExercisesFilter } from "#/features/routine/filters/exercise-group-exercises-filter.ts";

const decodeExercises = Schema.decodeUnknownSync(
  Schema.Array(Schema.String).check(exerciseGroupExercisesFilter),
);

describe("exerciseGroupExercisesFilter", () => {
  it("accepts an Exercise group of one exercise", () => {
    expect(decodeExercises(["bench-press"])).toStrictEqual(["bench-press"]);
  });

  it("rejects an Exercise group with no exercise", () => {
    expect(() => decodeExercises([])).toThrow(
      "Expected a value with a length of at least 1",
    );
  });
});
