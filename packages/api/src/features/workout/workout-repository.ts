import type { WorkoutSaveNoteInput } from "@ankaa/core/features/workout/schemas/workout-save-note-input-schema";
import type { WorkoutSaveSetInput } from "@ankaa/core/features/workout/schemas/workout-save-set-input-schema";
import type { WorkoutSaveSkipInput } from "@ankaa/core/features/workout/schemas/workout-save-skip-input-schema";
import type { Section } from "@ankaa/core/shared/constants/sections";
import type * as ExerciseDatabaseSchema from "@ankaa/database/schema/exercise";

import { WorkoutInProgressConflictError } from "@ankaa/core/features/workout/errors/workout-in-progress-conflict-error";
import { WorkoutNotFoundError } from "@ankaa/core/features/workout/errors/workout-not-found-error";
import { Database } from "@ankaa/database/database";
import * as RoutineDatabaseSchema from "@ankaa/database/schema/routine";
import {
  workout,
  workoutExercise,
  workoutExerciseGroup,
  workoutExercisePlannedSet,
  workoutExerciseRecordedSet,
  workoutExerciseRecordedSetSegment,
} from "@ankaa/database/schema/workout";
import { asc, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { buildPlannedSet } from "#/shared/build-planned-set.ts";
import { buildSections } from "#/shared/build-sections.ts";
import { catchUniqueIndexViolation } from "#/shared/catch-unique-index-violation.ts";
import { PLANNED_SET_COLUMNS } from "#/shared/planned-set-columns.ts";

type PlannedSetRow = Omit<
  typeof workoutExercisePlannedSet.$inferSelect,
  "id" | "position" | "workoutExerciseId"
>;

type RecordedSetRow = Pick<
  typeof workoutExerciseRecordedSet.$inferSelect,
  "id" | "position"
>;

type StartedRoutineRow = Pick<
  typeof RoutineDatabaseSchema.routine.$inferSelect,
  "deletedAt" | "id" | "userId"
> & {
  exerciseGroups: (Pick<
    typeof RoutineDatabaseSchema.routineExerciseGroup.$inferSelect,
    "position" | "section"
  > & {
    exercises: (StartedRoutineExerciseRow & {
      warmUpExercises: StartedRoutineExerciseRow[];
    })[];
  })[];
};

type StartedRoutineExerciseRow = Pick<
  typeof RoutineDatabaseSchema.routineExercise.$inferSelect,
  "exerciseId" | "note" | "position"
> & {
  exercise: Pick<
    typeof ExerciseDatabaseSchema.exercise.$inferSelect,
    "amountUnit" | "weightType"
  >;
  sets: (PlannedSetRow & { position: number })[];
};

type WorkoutExerciseRow = Pick<
  typeof workoutExercise.$inferSelect,
  | "amountUnit"
  | "exerciseId"
  | "id"
  | "note"
  | "plannedNote"
  | "skipNote"
  | "skipReason"
  | "weightType"
  | "weightUnit"
> & {
  plannedSets: (PlannedSetRow & { id: string })[];
  recordedSets: {
    id: string;
    segments: Pick<
      typeof workoutExerciseRecordedSetSegment.$inferSelect,
      "amount" | "weight"
    >[];
  }[];
};

type WorkoutOwnerRow = Pick<typeof workout.$inferSelect, "endedAt" | "userId">;

const WORKOUT_IN_PROGRESS_INDEX = "workout_in_progress_idx";

const RECORDED_SET_PRIMARY_KEY = "workout_exercise_recorded_set_pkey";

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
  note: true,
  plannedNote: true,
  skipNote: true,
  skipReason: true,
  weightType: true,
  weightUnit: true,
} as const;

const WORKOUT_EXERCISE_SETS = {
  plannedSets: {
    columns: { ...PLANNED_SET_COLUMNS, id: true },
    orderBy: { position: "asc" },
  },
  recordedSets: {
    columns: { id: true },
    orderBy: { position: "asc" },
    with: {
      segments: {
        columns: { amount: true, weight: true },
        orderBy: { position: "asc" },
      },
    },
  },
} as const;

export class WorkoutRepository extends Context.Service<
  WorkoutRepository,
  {
    readonly createSet: (options: {
      input: WorkoutSaveSetInput;
      position: number;
    }) => Effect.Effect<void, WorkoutNotFoundError>;
    readonly find: (options: {
      id: string;
    }) => Effect.Effect<null | Pick<typeof workout.$inferSelect, "userId">>;
    readonly findForUpdate: (options: {
      id: string;
    }) => Effect.Effect<null | WorkoutOwnerRow>;
    readonly findInProgress: (options: {
      userId: string;
    }) => Effect.Effect<null | ReturnType<typeof buildWorkout>>;
    readonly findRoutine: (options: {
      id: string;
    }) => Effect.Effect<null | StartedRoutineRow>;
    readonly findWorkoutExerciseForRecordedSetRemove: (options: {
      id: string;
    }) => Effect.Effect<null | {
      recordedSets: RecordedSetRow[];
      skipReason: (typeof workoutExercise.$inferSelect)["skipReason"];
      workout: WorkoutOwnerRow;
    }>;
    readonly findWorkoutExerciseForRecordedSetSave: (options: {
      id: string;
    }) => Effect.Effect<null | {
      plannedSets: ReturnType<typeof buildPlannedSet>[];
      recordedSets: RecordedSetRow[];
      skipReason: (typeof workoutExercise.$inferSelect)["skipReason"];
      weightType: (typeof workoutExercise.$inferSelect)["weightType"];
      workout: WorkoutOwnerRow;
    }>;
    readonly findWorkoutExerciseForUpdate: (options: {
      id: string;
    }) => Effect.Effect<null | { workout: WorkoutOwnerRow }>;
    readonly removeSet: (options: {
      id: string;
      movedRecordedSets: readonly { id: string; position: number }[];
    }) => Effect.Effect<void>;
    readonly saveNote: (options: {
      input: WorkoutSaveNoteInput;
    }) => Effect.Effect<void>;
    readonly saveSkip: (options: {
      input: WorkoutSaveSkipInput;
    }) => Effect.Effect<void>;
    readonly start: (options: {
      id: string;
      routine: StartedRoutineRow;
      userId: string;
    }) => Effect.Effect<void, WorkoutInProgressConflictError>;
    readonly stop: (options: { id: string }) => Effect.Effect<void>;
    readonly updateSet: (options: {
      input: WorkoutSaveSetInput;
    }) => Effect.Effect<void>;
  }
>()("@ankaa/api/features/workout/WorkoutRepository") {
  static readonly layerNoDeps = Layer.effect(
    WorkoutRepository,
    Effect.gen(function* () {
      const database = yield* Database;

      const find = Effect.fn("WorkoutRepository.find")(function* ({
        id,
      }: {
        id: string;
      }) {
        const workouts = yield* database
          .select({ userId: workout.userId })
          .from(workout)
          .where(eq(workout.id, id))
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
              columns: { id: true, startedAt: true },
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
                        ...WORKOUT_EXERCISE_SETS,
                        warmUpExercises: {
                          columns: WORKOUT_EXERCISE_COLUMNS,
                          orderBy: { position: "asc" },
                          with: WORKOUT_EXERCISE_SETS,
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
          const lockedRoutine = yield* shareRoutine({ id });

          if (lockedRoutine === null) {
            return null;
          }

          const routineRow = yield* database.query.routine
            .findFirst({
              columns: { id: true },
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

          return routineRow === undefined
            ? null
            : { ...lockedRoutine, ...routineRow };
        },
      );

      /**
       * Reads the Routine with `id` `FOR SHARE`, the one row a start locks
       * without changing it, so the start waits for a deletion of its
       * Routine that is committing, and then sees it deleted:
       * https://github.com/manuelcattelan/ankaa/issues/133
       */
      const shareRoutine = Effect.fn("WorkoutRepository.shareRoutine")(
        function* ({ id }: { id: string }) {
          const routines = yield* database
            .select({
              deletedAt: RoutineDatabaseSchema.routine.deletedAt,
              userId: RoutineDatabaseSchema.routine.userId,
            })
            .from(RoutineDatabaseSchema.routine)
            .where(eq(RoutineDatabaseSchema.routine.id, id))
            .for("share")
            .pipe(Effect.orDie);

          return routines[0] ?? null;
        },
      );

      const findWorkoutExerciseForUpdate = Effect.fn(
        "WorkoutRepository.findWorkoutExerciseForUpdate",
      )(function* ({ id }: { id: string }) {
        const lockedWorkoutExercise = yield* lockWorkoutExerciseWithWorkout({
          id,
        });

        return lockedWorkoutExercise === null
          ? null
          : { workout: lockedWorkoutExercise.workout };
      });

      const findWorkoutExerciseForRecordedSetRemove = Effect.fn(
        "WorkoutRepository.findWorkoutExerciseForRecordedSetRemove",
      )(function* ({ id }: { id: string }) {
        const lockedWorkoutExercise = yield* lockWorkoutExerciseWithWorkout({
          id,
        });

        if (lockedWorkoutExercise === null) {
          return null;
        }

        const recordedSets = yield* findRecordedSets({ workoutExerciseId: id });

        return {
          recordedSets,
          skipReason: lockedWorkoutExercise.skipReason,
          workout: lockedWorkoutExercise.workout,
        };
      });

      const findWorkoutExerciseForRecordedSetSave = Effect.fn(
        "WorkoutRepository.findWorkoutExerciseForRecordedSetSave",
      )(function* ({ id }: { id: string }) {
        const lockedWorkoutExercise = yield* lockWorkoutExerciseWithWorkout({
          id,
        });

        if (lockedWorkoutExercise === null) {
          return null;
        }

        const plannedSets = yield* database.query.workoutExercisePlannedSet
          .findMany({
            columns: { ...PLANNED_SET_COLUMNS, id: true },
            orderBy: { position: "asc" },
            where: { workoutExerciseId: id },
          })
          .pipe(Effect.orDie);
        const recordedSets = yield* findRecordedSets({ workoutExerciseId: id });

        return {
          plannedSets: plannedSets.map(buildPlannedSet),
          recordedSets,
          skipReason: lockedWorkoutExercise.skipReason,
          weightType: lockedWorkoutExercise.weightType,
          workout: lockedWorkoutExercise.workout,
        };
      });

      /**
       * Locks the Workout exercise with `id`, and then reads its Workout
       * `FOR SHARE`, and gives null when either row doesn't exist.
       */
      const lockWorkoutExerciseWithWorkout = Effect.fn(
        "WorkoutRepository.lockWorkoutExerciseWithWorkout",
      )(function* ({ id }: { id: string }) {
        const workoutExercises = yield* lockWorkoutExercise({ id });
        const workoutExerciseRow = workoutExercises[0];

        if (workoutExerciseRow === undefined) {
          return null;
        }

        const lockedWorkout = yield* shareWorkout({
          id: workoutExerciseRow.workoutId,
        });

        return lockedWorkout === null
          ? null
          : {
              skipReason: workoutExerciseRow.skipReason,
              weightType: workoutExerciseRow.weightType,
              workout: lockedWorkout,
            };
      });

      /**
       * Locks the Workout exercise with `id` for the write, and gives the id
       * of its Workout, which a Warm-up exercise reaches through the
       * Workout exercise it prepares for.
       */
      const lockWorkoutExercise = Effect.fn(
        "WorkoutRepository.lockWorkoutExercise",
      )(function* ({ id }: { id: string }) {
        const warmUpForWorkoutExercise = alias(
          workoutExercise,
          "warm_up_for_workout_exercise",
        );

        return yield* database
          .select({
            skipReason: workoutExercise.skipReason,
            weightType: workoutExercise.weightType,
            workoutId: workoutExerciseGroup.workoutId,
          })
          .from(workoutExercise)
          .leftJoin(
            warmUpForWorkoutExercise,
            eq(
              warmUpForWorkoutExercise.id,
              workoutExercise.warmUpForWorkoutExerciseId,
            ),
          )
          .innerJoin(
            workoutExerciseGroup,
            eq(
              workoutExerciseGroup.id,
              sql`coalesce(${workoutExercise.workoutExerciseGroupId}, ${warmUpForWorkoutExercise.workoutExerciseGroupId})`,
            ),
          )
          .where(eq(workoutExercise.id, id))
          .for("update", { of: workoutExercise })
          .pipe(Effect.orDie);
      });

      /**
       * Reads the Workout with `id` `FOR SHARE`, the one row a write of a
       * Set, a note or a Skip locks without changing it, so the write waits
       * for a stop of its Workout that is committing, and then sees it
       * stopped:
       * https://github.com/manuelcattelan/ankaa/issues/86#issuecomment-6502966213
       */
      const shareWorkout = Effect.fn("WorkoutRepository.shareWorkout")(
        function* ({ id }: { id: string }) {
          const workouts = yield* database
            .select({ endedAt: workout.endedAt, userId: workout.userId })
            .from(workout)
            .where(eq(workout.id, id))
            .for("share")
            .pipe(Effect.orDie);

          return workouts[0] ?? null;
        },
      );

      const findRecordedSets = Effect.fn("WorkoutRepository.findRecordedSets")(
        function* ({ workoutExerciseId }: { workoutExerciseId: string }) {
          return yield* database
            .select({
              id: workoutExerciseRecordedSet.id,
              position: workoutExerciseRecordedSet.position,
            })
            .from(workoutExerciseRecordedSet)
            .where(
              eq(
                workoutExerciseRecordedSet.workoutExerciseId,
                workoutExerciseId,
              ),
            )
            .orderBy(asc(workoutExerciseRecordedSet.position))
            .pipe(Effect.orDie);
        },
      );

      const removeSet = Effect.fn("WorkoutRepository.removeSet")(function* ({
        id,
        movedRecordedSets,
      }: {
        id: string;
        movedRecordedSets: readonly { id: string; position: number }[];
      }) {
        yield* database
          .delete(workoutExerciseRecordedSet)
          .where(eq(workoutExerciseRecordedSet.id, id))
          .pipe(Effect.orDie);

        // PostgreSQL checks a unique constraint that isn't deferrable after
        // each row, so the Sets move up one at a time, in order, each into
        // the position the previous one left free:
        // https://www.postgresql.org/docs/current/sql-createtable.html#SQL-CREATETABLE-COMPATIBILITY
        yield* Effect.forEach(
          movedRecordedSets,
          (movedRecordedSet) =>
            database
              .update(workoutExerciseRecordedSet)
              .set({ position: movedRecordedSet.position })
              .where(eq(workoutExerciseRecordedSet.id, movedRecordedSet.id))
              .pipe(Effect.orDie),
          { discard: true },
        );
      });

      const saveNote = Effect.fn("WorkoutRepository.saveNote")(function* ({
        input,
      }: {
        input: WorkoutSaveNoteInput;
      }) {
        yield* database
          .update(workoutExercise)
          .set({ note: input.note })
          .where(eq(workoutExercise.id, input.workoutExerciseId))
          .pipe(Effect.orDie);
      });

      const insertSegments = Effect.fn("WorkoutRepository.insertSegments")(
        function* ({ input }: { input: WorkoutSaveSetInput }) {
          yield* database
            .insert(workoutExerciseRecordedSetSegment)
            .values(
              input.segments.map((segment, segmentPosition) => ({
                amount: segment.amount,
                position: segmentPosition,
                weight: segment.weight,
                workoutExerciseRecordedSetId: input.id,
              })),
            )
            .pipe(Effect.orDie);
        },
      );

      const saveWeightUnit = Effect.fn("WorkoutRepository.saveWeightUnit")(
        function* ({ input }: { input: WorkoutSaveSetInput }) {
          yield* database
            .update(workoutExercise)
            .set({ weightUnit: input.weightUnit })
            .where(eq(workoutExercise.id, input.workoutExerciseId))
            .pipe(Effect.orDie);
        },
      );

      const createSet = Effect.fn("WorkoutRepository.createSet")(function* ({
        input,
        position,
      }: {
        input: WorkoutSaveSetInput;
        position: number;
      }) {
        yield* saveWeightUnit({ input });

        yield* database
          .insert(workoutExerciseRecordedSet)
          .values({
            id: input.id,
            position,
            workoutExerciseId: input.workoutExerciseId,
          })
          .pipe(
            catchUniqueIndexViolation({
              errors: {
                [RECORDED_SET_PRIMARY_KEY]: new WorkoutNotFoundError(),
              },
            }),
          );

        yield* insertSegments({ input });
      });

      const saveSkip = Effect.fn("WorkoutRepository.saveSkip")(function* ({
        input,
      }: {
        input: WorkoutSaveSkipInput;
      }) {
        yield* database
          .update(workoutExercise)
          .set({ skipNote: input.note, skipReason: input.reason })
          .where(eq(workoutExercise.id, input.workoutExerciseId))
          .pipe(Effect.orDie);
      });

      const start = Effect.fn("WorkoutRepository.start")(function* ({
        id,
        routine,
        userId,
      }: {
        id: string;
        routine: StartedRoutineRow;
        userId: string;
      }) {
        yield* database
          .insert(workout)
          .values({ id, routineId: routine.id, userId })
          .pipe(
            catchUniqueIndexViolation({
              errors: {
                [WORKOUT_IN_PROGRESS_INDEX]:
                  new WorkoutInProgressConflictError(),
              },
            }),
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

      const updateSet = Effect.fn("WorkoutRepository.updateSet")(function* ({
        input,
      }: {
        input: WorkoutSaveSetInput;
      }) {
        yield* saveWeightUnit({ input });

        yield* database
          .delete(workoutExerciseRecordedSetSegment)
          .where(
            eq(
              workoutExerciseRecordedSetSegment.workoutExerciseRecordedSetId,
              input.id,
            ),
          )
          .pipe(Effect.orDie);

        yield* insertSegments({ input });
      });

      return WorkoutRepository.of({
        createSet,
        find,
        findForUpdate,
        findInProgress,
        findRoutine,
        findWorkoutExerciseForRecordedSetRemove,
        findWorkoutExerciseForRecordedSetSave,
        findWorkoutExerciseForUpdate,
        removeSet,
        saveNote,
        saveSkip,
        start,
        stop,
        updateSet,
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
  startedAt: Date;
}) {
  return {
    id: workoutRow.id,
    sections: buildSections({
      buildExercise: buildWorkoutExercise,
      exerciseGroups: workoutRow.exerciseGroups,
    }),
    startedAt: workoutRow.startedAt,
  };
}

function buildWorkoutExercise(workoutExerciseRow: WorkoutExerciseRow) {
  return {
    amountUnit: workoutExerciseRow.amountUnit,
    exerciseId: workoutExerciseRow.exerciseId,
    id: workoutExerciseRow.id,
    note: workoutExerciseRow.note,
    plannedNote: workoutExerciseRow.plannedNote,
    plannedSets: workoutExerciseRow.plannedSets.map(buildPlannedSet),
    recordedSets: workoutExerciseRow.recordedSets,
    skipNote: workoutExerciseRow.skipNote,
    skipReason: workoutExerciseRow.skipReason,
    weightType: workoutExerciseRow.weightType,
    weightUnit: workoutExerciseRow.weightUnit,
  };
}

/**
 * Copies the columns of a Workout exercise from the Routine exercise it
 * starts from, together with the Weight type and Amount unit that its
 * Exercise has at the start.
 */
function buildWorkoutExerciseColumns(
  routineExercise: StartedRoutineExerciseRow,
) {
  return {
    amountUnit: routineExercise.exercise.amountUnit,
    exerciseId: routineExercise.exerciseId,
    plannedNote: routineExercise.note,
    position: routineExercise.position,
    weightType: routineExercise.exercise.weightType,
  };
}
