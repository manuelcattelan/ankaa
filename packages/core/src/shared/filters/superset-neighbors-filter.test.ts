import { describe, expect, it } from "@effect/vitest";
import * as Schema from "effect/Schema";

import { supersetNeighborsFilter } from "./superset-neighbors-filter.ts";

const decodeExercises = Schema.decodeUnknownSync(
  Schema.Array(
    Schema.Struct({
      position: Schema.Number,
      superset: Schema.NullOr(Schema.Number),
    }),
  ).check(supersetNeighborsFilter),
);

describe("supersetNeighborsFilter", () => {
  it("accepts the exercises of a Superset at neighboring positions", () => {
    expect(
      decodeExercises([
        { position: 0, superset: null },
        { position: 1, superset: 1 },
        { position: 2, superset: 1 },
        { position: 3, superset: 2 },
        { position: 4, superset: 2 },
      ]),
    ).toStrictEqual([
      { position: 0, superset: null },
      { position: 1, superset: 1 },
      { position: 2, superset: 1 },
      { position: 3, superset: 2 },
      { position: 4, superset: 2 },
    ]);
  });

  it("accepts the exercises of a Superset at neighboring positions listed out of order", () => {
    expect(
      decodeExercises([
        { position: 2, superset: 1 },
        { position: 0, superset: null },
        { position: 1, superset: 1 },
      ]),
    ).toStrictEqual([
      { position: 2, superset: 1 },
      { position: 0, superset: null },
      { position: 1, superset: 1 },
    ]);
  });

  it("accepts exercises outside any Superset that aren't neighbors", () => {
    expect(
      decodeExercises([
        { position: 0, superset: null },
        { position: 1, superset: 1 },
        { position: 2, superset: 1 },
        { position: 3, superset: null },
      ]),
    ).toStrictEqual([
      { position: 0, superset: null },
      { position: 1, superset: 1 },
      { position: 2, superset: 1 },
      { position: 3, superset: null },
    ]);
  });

  it("rejects the exercises of a Superset separated by an exercise outside any Superset", () => {
    expect(() =>
      decodeExercises([
        { position: 0, superset: 1 },
        { position: 1, superset: null },
        { position: 2, superset: 1 },
      ]),
    ).toThrow("The exercises of a superset must be neighbors");
  });

  it("rejects the exercises of a Superset separated by another Superset", () => {
    expect(() =>
      decodeExercises([
        { position: 0, superset: 1 },
        { position: 1, superset: 2 },
        { position: 2, superset: 1 },
      ]),
    ).toThrow("The exercises of a superset must be neighbors");
  });

  it("rejects the exercises of a Superset listed next to each other but separated by position", () => {
    expect(() =>
      decodeExercises([
        { position: 0, superset: 1 },
        { position: 2, superset: 1 },
        { position: 1, superset: null },
      ]),
    ).toThrow("The exercises of a superset must be neighbors");
  });
});
