import { describe, expect, it } from "@effect/vitest";
import * as Schema from "effect/Schema";

import { createLinkedWarmUpExercisesFilter } from "./create-linked-warm-up-exercises-filter.ts";

const decodeExercises = Schema.decodeUnknownSync(
  Schema.Array(
    Schema.Struct({
      id: Schema.String,
      section: Schema.String,
      warmUpForExerciseId: Schema.NullOr(Schema.String),
    }),
  ).check(
    createLinkedWarmUpExercisesFilter({
      warmUpForExerciseIdKey: "warmUpForExerciseId",
    }),
  ),
);

describe("createLinkedWarmUpExercisesFilter", () => {
  it("accepts a Warm-up exercise that points to another main exercise", () => {
    expect(
      decodeExercises([
        { id: "warm-up", section: "main", warmUpForExerciseId: "bench-press" },
        { id: "bench-press", section: "main", warmUpForExerciseId: null },
      ]),
    ).toStrictEqual([
      { id: "warm-up", section: "main", warmUpForExerciseId: "bench-press" },
      { id: "bench-press", section: "main", warmUpForExerciseId: null },
    ]);
  });

  it("rejects a Warm-up exercise that points to an exercise of another Section", () => {
    expect(() =>
      decodeExercises([
        { id: "warm-up", section: "main", warmUpForExerciseId: "stretch" },
        { id: "stretch", section: "cool_down", warmUpForExerciseId: null },
      ]),
    ).toThrow(
      'Must point to another main exercise of the same routine or workout\n  at [0]["warmUpForExerciseId"]',
    );
  });

  it("rejects a Warm-up exercise that points to itself", () => {
    expect(() =>
      decodeExercises([
        { id: "bench-press", section: "main", warmUpForExerciseId: null },
        { id: "warm-up", section: "main", warmUpForExerciseId: "warm-up" },
      ]),
    ).toThrow(
      'Must point to another main exercise of the same routine or workout\n  at [1]["warmUpForExerciseId"]',
    );
  });

  it("rejects a Warm-up exercise that points to an exercise missing from the list", () => {
    expect(() =>
      decodeExercises([
        { id: "warm-up", section: "main", warmUpForExerciseId: "squat" },
      ]),
    ).toThrow(
      'Must point to another main exercise of the same routine or workout\n  at [0]["warmUpForExerciseId"]',
    );
  });
});
