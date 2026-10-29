import * as Schema from "effect/Schema";
import { describe, expect, it } from "vitest";

import { uniqueRoutineIdsFilter } from "#/features/routine/filters/unique-routine-ids-filter.ts";

const routineExerciseSchema = Schema.Struct({
  id: Schema.String,
  sets: Schema.Array(Schema.Struct({ id: Schema.String })),
});

const exerciseGroupSchema = Schema.Struct({
  exercises: Schema.Array(routineExerciseSchema),
  id: Schema.String,
});

const decodeRoutine = Schema.decodeUnknownSync(
  Schema.Struct({
    id: Schema.String,
    sections: Schema.Struct({
      coolDown: Schema.Array(exerciseGroupSchema),
      main: Schema.Array(
        Schema.Struct({
          exercises: Schema.Array(
            Schema.Struct({
              ...routineExerciseSchema.fields,
              warmUpExercises: Schema.Array(routineExerciseSchema),
            }),
          ),
          id: Schema.String,
        }),
      ),
      warmUp: Schema.Array(exerciseGroupSchema),
    }),
  }).check(uniqueRoutineIdsFilter),
);

const ROUTINE = {
  id: "routine",
  sections: {
    coolDown: [
      {
        exercises: [{ id: "cool-down-exercise", sets: [{ id: "set-3" }] }],
        id: "cool-down-exercise-group",
      },
    ],
    main: [
      {
        exercises: [
          {
            id: "main-exercise",
            sets: [{ id: "set-1" }],
            warmUpExercises: [
              { id: "warm-up-exercise", sets: [{ id: "set-2" }] },
            ],
          },
        ],
        id: "main-exercise-group",
      },
    ],
    warmUp: [],
  },
};

describe("uniqueRoutineIdsFilter", () => {
  it("accepts a Routine whose ids are all different", () => {
    expect(decodeRoutine(ROUTINE)).toStrictEqual(ROUTINE);
  });

  it("rejects a Set whose id is a Routine exercise's id elsewhere in the tree", () => {
    expect(() =>
      decodeRoutine({
        ...ROUTINE,
        sections: {
          ...ROUTINE.sections,
          coolDown: [
            {
              exercises: [
                {
                  id: "cool-down-exercise",
                  sets: [{ id: "warm-up-exercise" }],
                },
              ],
              id: "cool-down-exercise-group",
            },
          ],
        },
      }),
    ).toThrow("Expected ids that are unique across the Routine");
  });

  it("rejects an Exercise group whose id is the Routine's id", () => {
    expect(() =>
      decodeRoutine({
        ...ROUTINE,
        sections: {
          ...ROUTINE.sections,
          warmUp: [{ exercises: [], id: "routine" }],
        },
      }),
    ).toThrow("Expected ids that are unique across the Routine");
  });
});
