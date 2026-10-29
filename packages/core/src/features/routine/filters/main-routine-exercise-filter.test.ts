import * as Schema from "effect/Schema";
import { describe, expect, it } from "vitest";

import { mainRoutineExerciseFilter } from "#/features/routine/filters/main-routine-exercise-filter.ts";

const decodeRoutine = Schema.decodeUnknownSync(
  Schema.Struct({
    sections: Schema.Struct({
      main: Schema.Array(
        Schema.Struct({ exercises: Schema.Array(Schema.String) }),
      ),
    }),
  }).check(mainRoutineExerciseFilter),
);

describe("mainRoutineExerciseFilter", () => {
  it("accepts a Routine with one Routine exercise in the main Section", () => {
    expect(
      decodeRoutine({ sections: { main: [{ exercises: ["bench-press"] }] } }),
    ).toStrictEqual({ sections: { main: [{ exercises: ["bench-press"] }] } });
  });

  it("rejects a Routine with no Exercise group in the main Section", () => {
    expect(() => decodeRoutine({ sections: { main: [] } })).toThrow(
      "Expected a Routine exercise in the main Section",
    );
  });

  it("rejects a Routine whose main Section holds only an empty Exercise group", () => {
    expect(() =>
      decodeRoutine({ sections: { main: [{ exercises: [] }] } }),
    ).toThrow("Expected a Routine exercise in the main Section");
  });
});
