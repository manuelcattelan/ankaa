import * as Schema from "effect/Schema";
import { describe, expect, it } from "vitest";

import { workingSetFilter } from "#/features/routine/filters/working-set-filter.ts";
import { SET_TYPES } from "#/shared/constants/set-types.ts";

const decodeRoutineExercise = Schema.decodeUnknownSync(
  Schema.Struct({
    sets: Schema.Array(Schema.Struct({ type: Schema.Literals(SET_TYPES) })),
  }).check(workingSetFilter),
);

describe("workingSetFilter", () => {
  it("accepts a Routine exercise that plans one Working set", () => {
    expect(
      decodeRoutineExercise({ sets: [{ type: "working" }] }),
    ).toStrictEqual({ sets: [{ type: "working" }] });
  });

  it("rejects a Routine exercise that plans no Set", () => {
    expect(() => decodeRoutineExercise({ sets: [] })).toThrow(
      "Expected a planned Working set",
    );
  });
});
