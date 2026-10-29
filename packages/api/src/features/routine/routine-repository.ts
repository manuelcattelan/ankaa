import type { Section } from "@ankaa/core/shared/constants/sections";
import type {
  routineExercise,
  routineExerciseSet,
} from "@ankaa/database/schema/routine";

import { DAYS_OF_WEEK } from "@ankaa/core/features/routine/constants/days-of-week";
import { Database } from "@ankaa/database/database";
import { routine } from "@ankaa/database/schema/routine";
import { eq, sql } from "drizzle-orm";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

type ListedRoutine = ReturnType<typeof buildRoutine>;

type RoutineExerciseRow = Pick<
  typeof routineExercise.$inferSelect,
  "exerciseId" | "id" | "note"
> & { sets: RoutineExerciseSetRow[] };

type RoutineExerciseSetRow = Omit<
  typeof routineExerciseSet.$inferSelect,
  "position" | "routineExerciseId"
>;

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

      return RoutineRepository.of({
        delete: deleteRoutine,
        findForUpdate,
        list,
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
      routineRow.days.some((routineDay) => routineDay.dayOfWeek === dayOfWeek),
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

function buildRoutineExercise(routineExercise: RoutineExerciseRow) {
  return {
    exerciseId: routineExercise.exerciseId,
    id: routineExercise.id,
    note: routineExercise.note,
    sets: routineExercise.sets.map((set) => ({
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
