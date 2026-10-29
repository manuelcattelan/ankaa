import type { RoutineSaveInput } from "@ankaa/core/features/routine/schemas/routine-save-input-schema";
import type { IntensityTechnique } from "@ankaa/core/shared/constants/intensity-techniques";
import type { Section } from "@ankaa/core/shared/constants/sections";

import { DAYS_OF_WEEK } from "@ankaa/core/features/routine/constants/days-of-week";
import { RoutineNameConflictError } from "@ankaa/core/features/routine/errors/routine-name-conflict-error";
import { Database } from "@ankaa/database/database";
import {
  routine,
  routineDay,
  routineExercise,
  routineExerciseGroup,
  routineExerciseSet,
} from "@ankaa/database/schema/routine";
import { eq, sql } from "drizzle-orm";
import * as Cause from "effect/Cause";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import { isSqlError } from "effect/sql/SqlError";

type ListedRoutine = ReturnType<typeof buildRoutine>;

type RoutineExerciseRow = Pick<
  typeof routineExercise.$inferSelect,
  "exerciseId" | "id" | "note"
> & { sets: RoutineExerciseSetRow[] };

type RoutineExerciseSetRow = Omit<
  typeof routineExerciseSet.$inferSelect,
  "position" | "routineExerciseId"
>;

const ROUTINE_NAME_INDEX = "routine_user_id_name_idx";

const INTENSITY_TECHNIQUE_COLUMN_VALUES = {
  DropSet: "drop_set",
  RestPauseSet: "rest_pause_set",
} as const satisfies Record<string, IntensityTechnique>;

const ROUTINE_EXERCISE_COLUMNS = {
  exerciseId: true,
  id: true,
  note: true,
} as const;

const ROUTINE_EXERCISE_SET_COLUMNS = {
  amount: true,
  id: true,
  intensityTechnique: true,
  isToFailure: true,
  pauseSeconds: true,
  restSeconds: true,
  segmentCount: true,
  tempo: true,
  type: true,
  weightPercentage: true,
} as const;

export class RoutineRepository extends Context.Service<
  RoutineRepository,
  {
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
    readonly save: (options: {
      input: RoutineSaveInput;
      userId: string;
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
                        columns: ROUTINE_EXERCISE_SET_COLUMNS,
                        orderBy: { position: "asc" },
                      },
                      warmUpExercises: {
                        columns: ROUTINE_EXERCISE_COLUMNS,
                        orderBy: { position: "asc" },
                        with: {
                          sets: {
                            columns: ROUTINE_EXERCISE_SET_COLUMNS,
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

      const save = Effect.fn("RoutineRepository.save")(function* ({
        input,
        userId,
      }: {
        input: RoutineSaveInput;
        userId: string;
      }) {
        const rows = buildRoutineRows(input);

        yield* database
          .insert(routine)
          .values({ id: input.id, name: input.name, userId })
          .onConflictDoUpdate({
            set: { name: input.name },
            target: routine.id,
          })
          .pipe(
            Effect.catch((error) =>
              isRoutineNameIndexViolation(error)
                ? Effect.fail(new RoutineNameConflictError())
                : Effect.die(error),
            ),
          );

        yield* database
          .delete(routineDay)
          .where(eq(routineDay.routineId, input.id))
          .pipe(Effect.orDie);

        yield* database
          .delete(routineExerciseGroup)
          .where(eq(routineExerciseGroup.routineId, input.id))
          .pipe(Effect.orDie);

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
      });

      return RoutineRepository.of({
        delete: deleteRoutine,
        findForUpdate,
        list,
        save,
      });
    }),
  );

  static readonly layer = RoutineRepository.layerNoDeps.pipe(
    Layer.provide(Database.layer),
  );
}

function buildIntensityTechnique(set: RoutineExerciseSetRow) {
  if (set.intensityTechnique === "drop_set" && set.segmentCount !== null) {
    return {
      _tag: "DropSet" as const,
      segmentCount: set.segmentCount,
      weightPercentage: set.weightPercentage,
    };
  }

  if (
    set.intensityTechnique === "rest_pause_set" &&
    set.segmentCount !== null &&
    set.pauseSeconds !== null
  ) {
    return {
      _tag: "RestPauseSet" as const,
      pauseSeconds: set.pauseSeconds,
      segmentCount: set.segmentCount,
    };
  }

  return null;
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
  function getSectionExerciseGroups(section: Section) {
    return routineRow.exerciseGroups.filter(
      (exerciseGroup) => exerciseGroup.section === section,
    );
  }

  return {
    days: DAYS_OF_WEEK.filter((dayOfWeek) =>
      routineRow.days.some((day) => day.dayOfWeek === dayOfWeek),
    ),
    id: routineRow.id,
    name: routineRow.name,
    sections: {
      coolDown: getSectionExerciseGroups("cool_down").map((exerciseGroup) => ({
        exercises: exerciseGroup.exercises.map(buildRoutineExercise),
        id: exerciseGroup.id,
      })),
      main: getSectionExerciseGroups("main").map((exerciseGroup) => ({
        exercises: exerciseGroup.exercises.map((mainRoutineExercise) => ({
          ...buildRoutineExercise(mainRoutineExercise),
          warmUpExercises:
            mainRoutineExercise.warmUpExercises.map(buildRoutineExercise),
        })),
        id: exerciseGroup.id,
      })),
      warmUp: getSectionExerciseGroups("warm_up").map((exerciseGroup) => ({
        exercises: exerciseGroup.exercises.map(buildRoutineExercise),
        id: exerciseGroup.id,
      })),
    },
  };
}

function buildRoutineExercise(routineExerciseRow: RoutineExerciseRow) {
  return {
    exerciseId: routineExerciseRow.exerciseId,
    id: routineExerciseRow.id,
    note: routineExerciseRow.note,
    sets: routineExerciseRow.sets.map((set) => ({
      amount: set.amount,
      id: set.id,
      intensityTechnique: buildIntensityTechnique(set),
      isToFailure: set.isToFailure,
      restSeconds: set.restSeconds,
      tempo: set.tempo,
      type: set.type,
    })),
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
      ({ routineExercise: setsRoutineExercise }) =>
        setsRoutineExercise.sets.map((set, position) => ({
          amount: set.amount,
          id: set.id,
          intensityTechnique:
            set.intensityTechnique === null
              ? null
              : INTENSITY_TECHNIQUE_COLUMN_VALUES[set.intensityTechnique._tag],
          isToFailure: set.isToFailure,
          pauseSeconds:
            set.intensityTechnique?._tag === "RestPauseSet"
              ? set.intensityTechnique.pauseSeconds
              : null,
          position,
          restSeconds: set.restSeconds,
          routineExerciseId: setsRoutineExercise.id,
          segmentCount: set.intensityTechnique?.segmentCount ?? null,
          tempo: set.tempo,
          type: set.type,
          weightPercentage:
            set.intensityTechnique?._tag === "DropSet"
              ? set.intensityTechnique.weightPercentage
              : null,
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
 * Tells whether a query failed on the index that keeps the names of a User's
 * live Routines unique, which the driver reports as a `UniqueViolation`
 * inside the query error's `Cause`.
 */
function isRoutineNameIndexViolation(error: { cause: unknown }) {
  return (
    Cause.isCause(error.cause) &&
    Option.exists(
      Cause.findErrorOption(error.cause),
      (sqlError) =>
        isSqlError(sqlError) &&
        sqlError.reason._tag === "UniqueViolation" &&
        sqlError.reason.constraint === ROUTINE_NAME_INDEX,
    )
  );
}
