import type { Section } from "@ankaa/core/shared/constants/sections";
import type * as ExerciseDatabaseSchema from "@ankaa/database/schema/exercise";
import type * as RoutineDatabaseSchema from "@ankaa/database/schema/routine";

import { WorkoutInProgressConflictError } from "@ankaa/core/features/workout/errors/workout-in-progress-conflict-error";
import { Database } from "@ankaa/database/database";
import {
  workout,
  workoutExercise,
  workoutExerciseGroup,
  workoutExercisePlannedSet,
} from "@ankaa/database/schema/workout";
import { and, eq, sql } from "drizzle-orm";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { buildIntensityTechnique } from "#/shared/build-intensity-technique.ts";
import { isUniqueIndexViolation } from "#/shared/is-unique-index-violation.ts";

type PlannedSetColumns = Omit<
  typeof workoutExercisePlannedSet.$inferSelect,
  "id" | "position" | "workoutExerciseId"
>;

type StartedRoutine = Pick<
  typeof RoutineDatabaseSchema.routine.$inferSelect,
  "deletedAt" | "id" | "userId"
> & {
  exerciseGroups: (Pick<
    typeof RoutineDatabaseSchema.routineExerciseGroup.$inferSelect,
    "position" | "section"
  > & {
    exercises: (StartedRoutineExercise & {
      warmUpExercises: StartedRoutineExercise[];
    })[];
  })[];
};

type StartedRoutineExercise = Pick<
  typeof RoutineDatabaseSchema.routineExercise.$inferSelect,
  "exerciseId" | "note" | "position"
> & {
  exercise: Pick<
    typeof ExerciseDatabaseSchema.exercise.$inferSelect,
    "amountUnit" | "weightType"
  >;
  sets: (PlannedSetColumns & { position: number })[];
};

type WorkoutExerciseRow = Pick<
  typeof workoutExercise.$inferSelect,
  "amountUnit" | "exerciseId" | "id" | "plannedNote" | "weightType"
> & {
  plannedSets: (PlannedSetColumns & { id: string })[];
};

const WORKOUT_IN_PROGRESS_INDEX = "workout_in_progress_idx";

const PLANNED_SET_COLUMNS = {
  amount: true,
  intensityTechnique: true,
  isToFailure: true,
  pauseSeconds: true,
  restSeconds: true,
  segmentCount: true,
  tempo: true,
  type: true,
  weightPercentage: true,
} as const;

const ROUTINE_EXERCISE_COLUMNS = {
  exerciseId: true,
  note: true,
  position: true,
} as const;

const ROUTINE_EXERCISE_RELATIONS = {
  exercise: { columns: { amountUnit: true, weightType: true } },
  sets: { columns: { ...PLANNED_SET_COLUMNS, position: true } },
} as const;

const WORKOUT_EXERCISE_COLUMNS = {
  amountUnit: true,
  exerciseId: true,
  id: true,
  plannedNote: true,
  weightType: true,
} as const;

const WORKOUT_EXERCISE_PLANNED_SETS = {
  plannedSets: {
    columns: { ...PLANNED_SET_COLUMNS, id: true },
    orderBy: { position: "asc" },
  },
} as const;

export class WorkoutRepository extends Context.Service<
  WorkoutRepository,
  {
    readonly find: (options: {
      id: string;
      userId: string;
    }) => Effect.Effect<null | { id: string }>;
    readonly findForUpdate: (options: {
      id: string;
    }) => Effect.Effect<null | Pick<
      typeof workout.$inferSelect,
      "endedAt" | "userId"
    >>;
    readonly findInProgress: (options: {
      userId: string;
    }) => Effect.Effect<null | ReturnType<typeof buildWorkout>>;
    readonly findRoutine: (options: {
      id: string;
    }) => Effect.Effect<null | StartedRoutine>;
    readonly start: (options: {
      id: string;
      routine: StartedRoutine;
      userId: string;
    }) => Effect.Effect<void, WorkoutInProgressConflictError>;
    readonly stop: (options: { id: string }) => Effect.Effect<void>;
  }
>()("@ankaa/api/features/workout/WorkoutRepository") {
  static readonly layerNoDeps = Layer.effect(
    WorkoutRepository,
    Effect.gen(function* () {
      const database = yield* Database;

      const find = Effect.fn("WorkoutRepository.find")(function* ({
        id,
        userId,
      }: {
        id: string;
        userId: string;
      }) {
        const workouts = yield* database
          .select({ id: workout.id })
          .from(workout)
          .where(and(eq(workout.id, id), eq(workout.userId, userId)))
          .pipe(Effect.orDie);

        return workouts[0] ?? null;
      });

      const findForUpdate = Effect.fn("WorkoutRepository.findForUpdate")(
        function* ({ id }: { id: string }) {
          const workouts = yield* database
            .select({ endedAt: workout.endedAt, userId: workout.userId })
            .from(workout)
            .where(eq(workout.id, id))
            .for("update")
            .pipe(Effect.orDie);

          return workouts[0] ?? null;
        },
      );

      const findInProgress = Effect.fn("WorkoutRepository.findInProgress")(
        function* ({ userId }: { userId: string }) {
          const workoutRow = yield* database.query.workout
            .findFirst({
              columns: { id: true },
              where: { endedAt: { isNull: true }, userId },
              with: {
                exerciseGroups: {
                  columns: { id: true, section: true },
                  orderBy: { position: "asc" },
                  with: {
                    exercises: {
                      columns: WORKOUT_EXERCISE_COLUMNS,
                      orderBy: { position: "asc" },
                      with: {
                        ...WORKOUT_EXERCISE_PLANNED_SETS,
                        warmUpExercises: {
                          columns: WORKOUT_EXERCISE_COLUMNS,
                          orderBy: { position: "asc" },
                          with: WORKOUT_EXERCISE_PLANNED_SETS,
                        },
                      },
                    },
                  },
                },
              },
            })
            .pipe(Effect.orDie);

          return workoutRow === undefined ? null : buildWorkout(workoutRow);
        },
      );

      const findRoutine = Effect.fn("WorkoutRepository.findRoutine")(
        function* ({ id }: { id: string }) {
          const routineRow = yield* database.query.routine
            .findFirst({
              columns: { deletedAt: true, id: true, userId: true },
              where: { id },
              with: {
                exerciseGroups: {
                  columns: { position: true, section: true },
                  with: {
                    exercises: {
                      columns: ROUTINE_EXERCISE_COLUMNS,
                      with: {
                        ...ROUTINE_EXERCISE_RELATIONS,
                        warmUpExercises: {
                          columns: ROUTINE_EXERCISE_COLUMNS,
                          with: ROUTINE_EXERCISE_RELATIONS,
                        },
                      },
                    },
                  },
                },
              },
            })
            .pipe(Effect.orDie);

          return routineRow ?? null;
        },
      );

      const start = Effect.fn("WorkoutRepository.start")(function* ({
        id,
        routine,
        userId,
      }: {
        id: string;
        routine: StartedRoutine;
        userId: string;
      }) {
        yield* database
          .insert(workout)
          .values({ id, routineId: routine.id, userId })
          .pipe(
            Effect.catch((error) =>
              isUniqueIndexViolation({
                error,
                index: WORKOUT_IN_PROGRESS_INDEX,
              })
                ? Effect.fail(new WorkoutInProgressConflictError())
                : Effect.die(error),
            ),
          );

        const insertedExerciseGroups = yield* database
          .insert(workoutExerciseGroup)
          .values(
            routine.exerciseGroups.map((exerciseGroup) => ({
              position: exerciseGroup.position,
              section: exerciseGroup.section,
              workoutId: id,
            })),
          )
          .returning({
            id: workoutExerciseGroup.id,
            position: workoutExerciseGroup.position,
            section: workoutExerciseGroup.section,
          })
          .pipe(Effect.orDie);

        const groupedExercises = routine.exerciseGroups.flatMap(
          (exerciseGroup) =>
            insertedExerciseGroups
              .filter(
                (insertedExerciseGroup) =>
                  insertedExerciseGroup.section === exerciseGroup.section &&
                  insertedExerciseGroup.position === exerciseGroup.position,
              )
              .flatMap((insertedExerciseGroup) =>
                exerciseGroup.exercises.map((routineExercise) => ({
                  routineExercise,
                  workoutExerciseGroupId: insertedExerciseGroup.id,
                })),
              ),
        );

        const insertedGroupedExercises = yield* database
          .insert(workoutExercise)
          .values(
            groupedExercises.map(
              ({ routineExercise, workoutExerciseGroupId }) => ({
                ...buildWorkoutExerciseColumns(routineExercise),
                workoutExerciseGroupId,
              }),
            ),
          )
          .returning({
            id: workoutExercise.id,
            position: workoutExercise.position,
            workoutExerciseGroupId: workoutExercise.workoutExerciseGroupId,
          })
          .pipe(Effect.orDie);

        const copiedGroupedExercises = groupedExercises.flatMap(
          (groupedExercise) =>
            insertedGroupedExercises
              .filter(
                (insertedExercise) =>
                  insertedExercise.workoutExerciseGroupId ===
                    groupedExercise.workoutExerciseGroupId &&
                  insertedExercise.position ===
                    groupedExercise.routineExercise.position,
              )
              .map((insertedExercise) => ({
                id: insertedExercise.id,
                routineExercise: groupedExercise.routineExercise,
              })),
        );

        const warmUpExercises = copiedGroupedExercises.flatMap(
          (copiedExercise) =>
            copiedExercise.routineExercise.warmUpExercises.map(
              (routineExercise) => ({
                routineExercise,
                warmUpForWorkoutExerciseId: copiedExercise.id,
              }),
            ),
        );

        const insertedWarmUpExercises =
          warmUpExercises.length === 0
            ? []
            : yield* database
                .insert(workoutExercise)
                .values(
                  warmUpExercises.map(
                    ({ routineExercise, warmUpForWorkoutExerciseId }) => ({
                      ...buildWorkoutExerciseColumns(routineExercise),
                      warmUpForWorkoutExerciseId,
                    }),
                  ),
                )
                .returning({
                  id: workoutExercise.id,
                  position: workoutExercise.position,
                  warmUpForWorkoutExerciseId:
                    workoutExercise.warmUpForWorkoutExerciseId,
                })
                .pipe(Effect.orDie);

        const copiedWarmUpExercises = warmUpExercises.flatMap(
          (warmUpExercise) =>
            insertedWarmUpExercises
              .filter(
                (insertedExercise) =>
                  insertedExercise.warmUpForWorkoutExerciseId ===
                    warmUpExercise.warmUpForWorkoutExerciseId &&
                  insertedExercise.position ===
                    warmUpExercise.routineExercise.position,
              )
              .map((insertedExercise) => ({
                id: insertedExercise.id,
                routineExercise: warmUpExercise.routineExercise,
              })),
        );

        const plannedSets = [
          ...copiedGroupedExercises,
          ...copiedWarmUpExercises,
        ].flatMap((copiedExercise) =>
          copiedExercise.routineExercise.sets.map((set) => ({
            ...set,
            workoutExerciseId: copiedExercise.id,
          })),
        );

        if (plannedSets.length > 0) {
          yield* database
            .insert(workoutExercisePlannedSet)
            .values(plannedSets)
            .pipe(Effect.orDie);
        }
      });

      const stop = Effect.fn("WorkoutRepository.stop")(function* ({
        id,
      }: {
        id: string;
      }) {
        yield* database
          .update(workout)
          .set({ endedAt: sql`now()` })
          .where(eq(workout.id, id))
          .pipe(Effect.orDie);
      });

      return WorkoutRepository.of({
        find,
        findForUpdate,
        findInProgress,
        findRoutine,
        start,
        stop,
      });
    }),
  );

  static readonly layer = WorkoutRepository.layerNoDeps.pipe(
    Layer.provide(Database.layer),
  );
}

/**
 * Builds the tree of a Workout that `workout.findInProgress` returns from its
 * rows, which carry their Section and leave each Warm-up exercise under the
 * main Section's Workout exercise that it prepares for.
 */
function buildWorkout(workoutRow: {
  exerciseGroups: {
    exercises: (WorkoutExerciseRow & {
      warmUpExercises: WorkoutExerciseRow[];
    })[];
    id: string;
    section: Section;
  }[];
  id: string;
}) {
  function getSectionExerciseGroups(section: Section) {
    return workoutRow.exerciseGroups.filter(
      (exerciseGroup) => exerciseGroup.section === section,
    );
  }

  return {
    id: workoutRow.id,
    sections: {
      coolDown: getSectionExerciseGroups("cool_down").map((exerciseGroup) => ({
        exercises: exerciseGroup.exercises.map(buildWorkoutExercise),
        id: exerciseGroup.id,
      })),
      main: getSectionExerciseGroups("main").map((exerciseGroup) => ({
        exercises: exerciseGroup.exercises.map((mainWorkoutExercise) => ({
          ...buildWorkoutExercise(mainWorkoutExercise),
          warmUpExercises:
            mainWorkoutExercise.warmUpExercises.map(buildWorkoutExercise),
        })),
        id: exerciseGroup.id,
      })),
      warmUp: getSectionExerciseGroups("warm_up").map((exerciseGroup) => ({
        exercises: exerciseGroup.exercises.map(buildWorkoutExercise),
        id: exerciseGroup.id,
      })),
    },
  };
}

function buildWorkoutExercise(workoutExerciseRow: WorkoutExerciseRow) {
  return {
    amountUnit: workoutExerciseRow.amountUnit,
    exerciseId: workoutExerciseRow.exerciseId,
    id: workoutExerciseRow.id,
    plannedNote: workoutExerciseRow.plannedNote,
    plannedSets: workoutExerciseRow.plannedSets.map((plannedSet) => ({
      amount: plannedSet.amount,
      id: plannedSet.id,
      intensityTechnique: buildIntensityTechnique(plannedSet),
      isToFailure: plannedSet.isToFailure,
      restSeconds: plannedSet.restSeconds,
      tempo: plannedSet.tempo,
      type: plannedSet.type,
    })),
    weightType: workoutExerciseRow.weightType,
  };
}

/**
 * Copies the columns of a Workout exercise from the Routine exercise it
 * starts from, together with the Weight type and Amount unit that its
 * Exercise has at the start.
 */
function buildWorkoutExerciseColumns(routineExercise: StartedRoutineExercise) {
  return {
    amountUnit: routineExercise.exercise.amountUnit,
    exerciseId: routineExercise.exerciseId,
    plannedNote: routineExercise.note,
    position: routineExercise.position,
    weightType: routineExercise.exercise.weightType,
  };
}
