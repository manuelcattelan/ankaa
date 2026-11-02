import type { RoutineSaveInput } from "@ankaa/core/features/routine/schemas/routine-save-input-schema";
import type { Section } from "@ankaa/core/shared/constants/sections";

import { DAYS_OF_WEEK } from "@ankaa/core/features/routine/constants/days-of-week";
import { RoutineNameConflictError } from "@ankaa/core/features/routine/errors/routine-name-conflict-error";
import { INTENSITY_TECHNIQUE_VALUES } from "@ankaa/core/shared/constants/intensity-techniques";
import { RoutineNotFoundError } from "@ankaa/core/shared/errors/routine-not-found-error";
import { Database } from "@ankaa/database/database";
import {
  routine,
  routineDay,
  routineExercise,
  routineExerciseGroup,
  routineExerciseSet,
} from "@ankaa/database/schema/routine";
import { eq, sql } from "drizzle-orm";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { buildPlannedSet } from "#/shared/build-planned-set.ts";
import { buildSections } from "#/shared/build-sections.ts";
import { catchUniqueIndexViolation } from "#/shared/catch-unique-index-violation.ts";
import { PLANNED_SET_COLUMNS } from "#/shared/planned-set-columns.ts";

type ListedRoutine = ReturnType<typeof buildRoutine>;

type RoutineExerciseRow = Pick<
  typeof routineExercise.$inferSelect,
  "exerciseId" | "id" | "note"
> & { sets: RoutineExerciseSetRow[] };

type RoutineExerciseSetRow = Omit<
  typeof routineExerciseSet.$inferSelect,
  "position" | "routineExerciseId"
>;

const ROUTINE_NAME_INDEX = "routine_live_name_idx";

const ROUTINE_PRIMARY_KEY = "routine_pkey";

const ROUTINE_EXERCISE_COLUMNS = {
  exerciseId: true,
  id: true,
  note: true,
} as const;

export class RoutineRepository extends Context.Service<
  RoutineRepository,
  {
    readonly create: (options: {
      input: RoutineSaveInput;
      userId: string;
    }) => Effect.Effect<void, RoutineNameConflictError | RoutineNotFoundError>;
    readonly delete: (options: { id: string }) => Effect.Effect<void>;
    readonly findForUpdate: (options: {
      id: string;
    }) => Effect.Effect<null | Pick<
      typeof routine.$inferSelect,
      "deletedAt" | "userId"
    >>;
    readonly list: (options: {
      userId: string;
    }) => Effect.Effect<ListedRoutine[]>;
    readonly update: (options: {
      input: RoutineSaveInput;
    }) => Effect.Effect<void, RoutineNameConflictError>;
  }
>()("@ankaa/api/features/routine/RoutineRepository") {
  static readonly layerNoDeps = Layer.effect(
    RoutineRepository,
    Effect.gen(function* () {
      const database = yield* Database;

      const deleteRoutine = Effect.fn("RoutineRepository.delete")(function* ({
        id,
      }: {
        id: string;
      }) {
        yield* database
          .update(routine)
          .set({ deletedAt: sql`now()` })
          .where(eq(routine.id, id))
          .pipe(Effect.orDie);
      });

      const findForUpdate = Effect.fn("RoutineRepository.findForUpdate")(
        function* ({ id }: { id: string }) {
          const routines = yield* database
            .select({ deletedAt: routine.deletedAt, userId: routine.userId })
            .from(routine)
            .where(eq(routine.id, id))
            .for("update")
            .pipe(Effect.orDie);

          return routines[0] ?? null;
        },
      );

      const list = Effect.fn("RoutineRepository.list")(function* ({
        userId,
      }: {
        userId: string;
      }) {
        const routines = yield* database.query.routine
          .findMany({
            columns: { id: true, name: true },
            orderBy: { name: "asc" },
            where: { deletedAt: { isNull: true }, userId },
            with: {
              days: { columns: { dayOfWeek: true } },
              exerciseGroups: {
                columns: { id: true, section: true },
                orderBy: { position: "asc" },
                with: {
                  exercises: {
                    columns: ROUTINE_EXERCISE_COLUMNS,
                    orderBy: { position: "asc" },
                    with: {
                      sets: {
                        columns: { ...PLANNED_SET_COLUMNS, id: true },
                        orderBy: { position: "asc" },
                      },
                      warmUpExercises: {
                        columns: ROUTINE_EXERCISE_COLUMNS,
                        orderBy: { position: "asc" },
                        with: {
                          sets: {
                            columns: { ...PLANNED_SET_COLUMNS, id: true },
                            orderBy: { position: "asc" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          })
          .pipe(Effect.orDie);

        return routines.map(buildRoutine);
      });

      const insertChildren = Effect.fn("RoutineRepository.insertChildren")(
        function* ({ input }: { input: RoutineSaveInput }) {
          const rows = buildRoutineRows(input);

          if (rows.days.length > 0) {
            yield* database
              .insert(routineDay)
              .values(rows.days)
              .pipe(Effect.orDie);
          }

          if (rows.exerciseGroups.length > 0) {
            yield* database
              .insert(routineExerciseGroup)
              .values(rows.exerciseGroups)
              .pipe(Effect.orDie);
          }

          if (rows.exercises.length > 0) {
            yield* database
              .insert(routineExercise)
              .values(rows.exercises)
              .pipe(Effect.orDie);
          }

          if (rows.warmUpExercises.length > 0) {
            yield* database
              .insert(routineExercise)
              .values(rows.warmUpExercises)
              .pipe(Effect.orDie);
          }

          if (rows.sets.length > 0) {
            yield* database
              .insert(routineExerciseSet)
              .values(rows.sets)
              .pipe(Effect.orDie);
          }
        },
      );

      const create = Effect.fn("RoutineRepository.create")(function* ({
        input,
        userId,
      }: {
        input: RoutineSaveInput;
        userId: string;
      }) {
        yield* database
          .insert(routine)
          .values({ id: input.id, name: input.name, userId })
          .pipe(
            catchUniqueIndexViolation({
              errors: {
                [ROUTINE_NAME_INDEX]: new RoutineNameConflictError(),
                [ROUTINE_PRIMARY_KEY]: new RoutineNotFoundError(),
              },
            }),
          );

        yield* insertChildren({ input });
      });

      const update = Effect.fn("RoutineRepository.update")(function* ({
        input,
      }: {
        input: RoutineSaveInput;
      }) {
        yield* database
          .update(routine)
          .set({ name: input.name })
          .where(eq(routine.id, input.id))
          .pipe(
            catchUniqueIndexViolation({
              errors: { [ROUTINE_NAME_INDEX]: new RoutineNameConflictError() },
            }),
          );

        yield* database
          .delete(routineDay)
          .where(eq(routineDay.routineId, input.id))
          .pipe(Effect.orDie);

        yield* database
          .delete(routineExerciseGroup)
          .where(eq(routineExerciseGroup.routineId, input.id))
          .pipe(Effect.orDie);

        yield* insertChildren({ input });
      });

      return RoutineRepository.of({
        create,
        delete: deleteRoutine,
        findForUpdate,
        list,
        update,
      });
    }),
  );

  static readonly layer = RoutineRepository.layerNoDeps.pipe(
    Layer.provide(Database.layer),
  );
}

/**
 * Builds the tree of a Routine that `routine.list` returns from its rows,
 * which carry their Section and leave each Warm-up exercise under the main
 * Section's Routine exercise that it prepares for.
 */
function buildRoutine(routineRow: {
  days: { dayOfWeek: (typeof DAYS_OF_WEEK)[number] }[];
  exerciseGroups: {
    exercises: (RoutineExerciseRow & {
      warmUpExercises: RoutineExerciseRow[];
    })[];
    id: string;
    section: Section;
  }[];
  id: string;
  name: string;
}) {
  return {
    days: DAYS_OF_WEEK.filter((dayOfWeek) =>
      routineRow.days.some((day) => day.dayOfWeek === dayOfWeek),
    ),
    id: routineRow.id,
    name: routineRow.name,
    sections: buildSections({
      buildExercise: buildRoutineExercise,
      exerciseGroups: routineRow.exerciseGroups,
    }),
  };
}

function buildRoutineExercise(routineExerciseRow: RoutineExerciseRow) {
  return {
    exerciseId: routineExerciseRow.exerciseId,
    id: routineExerciseRow.id,
    note: routineExerciseRow.note,
    sets: routineExerciseRow.sets.map(buildPlannedSet),
  };
}

/**
 * Builds the rows of a Routine's children from the tree that a Save takes,
 * each at the position its array gives it.
 */
function buildRoutineRows(input: RoutineSaveInput) {
  const exerciseGroups = [
    ...input.sections.warmUp.map((exerciseGroup, position) => ({
      exerciseGroup,
      position,
      section: "warm_up" as const,
    })),
    ...input.sections.main.map((exerciseGroup, position) => ({
      exerciseGroup,
      position,
      section: "main" as const,
    })),
    ...input.sections.coolDown.map((exerciseGroup, position) => ({
      exerciseGroup,
      position,
      section: "cool_down" as const,
    })),
  ];
  const exercises = exerciseGroups.flatMap(({ exerciseGroup }) =>
    exerciseGroup.exercises.map((groupedRoutineExercise, position) => ({
      position,
      routineExercise: groupedRoutineExercise,
      routineExerciseGroupId: exerciseGroup.id,
    })),
  );
  const warmUpExercises = input.sections.main.flatMap((exerciseGroup) =>
    exerciseGroup.exercises.flatMap((mainRoutineExercise) =>
      mainRoutineExercise.warmUpExercises.map(
        (warmUpRoutineExercise, position) => ({
          position,
          routineExercise: warmUpRoutineExercise,
          warmUpForRoutineExerciseId: mainRoutineExercise.id,
        }),
      ),
    ),
  );

  return {
    days: input.days.map((dayOfWeek) => ({
      dayOfWeek,
      routineId: input.id,
    })),
    exerciseGroups: exerciseGroups.map(
      ({ exerciseGroup, position, section }) => ({
        id: exerciseGroup.id,
        position,
        routineId: input.id,
        section,
      }),
    ),
    exercises: exercises.map(
      ({
        position,
        routineExercise: groupedRoutineExercise,
        routineExerciseGroupId,
      }) => ({
        exerciseId: groupedRoutineExercise.exerciseId,
        id: groupedRoutineExercise.id,
        note: groupedRoutineExercise.note,
        position,
        routineExerciseGroupId,
      }),
    ),
    sets: [...exercises, ...warmUpExercises].flatMap(
      ({ routineExercise: owningRoutineExercise }) =>
        owningRoutineExercise.sets.map((set, position) => ({
          amount: set.amount,
          id: set.id,
          ...encodeIntensityTechnique(set.intensityTechnique),
          isToFailure: set.isToFailure,
          position,
          restSeconds: set.restSeconds,
          routineExerciseId: owningRoutineExercise.id,
          tempo: set.tempo,
          type: set.type,
        })),
    ),
    warmUpExercises: warmUpExercises.map(
      ({
        position,
        routineExercise: warmUpRoutineExercise,
        warmUpForRoutineExerciseId,
      }) => ({
        exerciseId: warmUpRoutineExercise.exerciseId,
        id: warmUpRoutineExercise.id,
        note: warmUpRoutineExercise.note,
        position,
        warmUpForRoutineExerciseId,
      }),
    ),
  };
}

/**
 * Gives the columns that store the Intensity technique of a planned Set, the
 * reverse of `buildIntensityTechnique`.
 */
function encodeIntensityTechnique(
  intensityTechnique: RoutineSaveInput["sections"]["main"][number]["exercises"][number]["sets"][number]["intensityTechnique"],
) {
  return {
    intensityTechnique:
      intensityTechnique === null
        ? null
        : INTENSITY_TECHNIQUE_VALUES[intensityTechnique._tag],
    pauseSeconds:
      intensityTechnique?._tag === "RestPauseSet"
        ? intensityTechnique.pauseSeconds
        : null,
    segmentCount: intensityTechnique?.segmentCount ?? null,
    weightPercentage:
      intensityTechnique?._tag === "DropSet"
        ? intensityTechnique.weightPercentage
        : null,
  };
}
