import { database } from "@ankaa/database";
import {
  AMOUNT_MINIMUM,
  AMOUNT_UNITS,
  POSITION_MINIMUM,
  SECTIONS,
  SET_TYPES,
  SKIP_REASONS,
  TEMPO_PATTERN,
  VARIATIONS,
  WEIGHT_TYPES,
  WEIGHT_UNITS,
  WEIGHT_VALUE_MAXIMUM,
  WEIGHT_VALUE_MINIMUM,
  WEIGHT_VALUE_STEP,
} from "@ankaa/database/constants";
import { and, eq, gte, isNull, lt, ne, sql } from "@ankaa/database/operators";
import * as Schema from "@ankaa/database/schema";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, router } from "../trpc.ts";
import {
  checkLinkedWarmUpExercises,
  checkSupersetNeighbors,
  checkUniqueValues,
} from "../utilities/validation.ts";

const workoutExerciseSetSegmentSchema = z
  .object({
    amount: z.int32().min(AMOUNT_MINIMUM).nullable(),
    id: z.uuidv7(),
    position: z.int32().min(POSITION_MINIMUM),
    weightUnit: z.enum(WEIGHT_UNITS).nullable(),
    weightValue: z
      .number()
      .min(WEIGHT_VALUE_MINIMUM)
      .max(WEIGHT_VALUE_MAXIMUM)
      .multipleOf(WEIGHT_VALUE_STEP)
      .nullable(),
  })
  .superRefine((workoutExerciseSetSegment, context) => {
    if (
      typeof workoutExerciseSetSegment.weightValue === "number" &&
      typeof workoutExerciseSetSegment.weightUnit !== "string"
    ) {
      context.addIssue({
        code: "custom",
        message: "Must be filled when the weight value is filled",
        path: ["weightUnit"],
      });
    }
  });

const workoutExerciseSetSchema = z.object({
  id: z.uuidv7(),
  isToFailure: z.boolean(),
  position: z.int32().min(POSITION_MINIMUM),
  segments: z
    .array(workoutExerciseSetSegmentSchema)
    .nonempty()
    .superRefine((workoutExerciseSetSegments, context) => {
      checkUniqueValues({
        context,
        values: workoutExerciseSetSegments.map(
          (workoutExerciseSetSegment) => workoutExerciseSetSegment.position,
        ),
      });
    }),
  setType: z.enum(SET_TYPES),
  tempo: z.string().regex(TEMPO_PATTERN).nullable(),
  variation: z.enum(VARIATIONS).nullable(),
});

const workoutExerciseSchema = z
  .object({
    amountUnit: z.enum(AMOUNT_UNITS),
    exerciseId: z.uuidv7(),
    id: z.uuidv7(),
    note: z.string().nullable(),
    position: z.int32().min(POSITION_MINIMUM),
    section: z.enum(SECTIONS),
    sets: z
      .array(workoutExerciseSetSchema)
      .superRefine((workoutExerciseSets, context) => {
        checkUniqueValues({
          context,
          values: workoutExerciseSets.map(
            (workoutExerciseSet) => workoutExerciseSet.position,
          ),
        });
      }),
    skipReason: z.enum(SKIP_REASONS).nullable(),
    skipReasonNote: z.string().nullable(),
    superset: z.int32().nullable(),
    warmUpForWorkoutExerciseId: z.uuidv7().nullable(),
    weightType: z.enum(WEIGHT_TYPES),
  })
  .superRefine((workoutExercise, context) => {
    if (
      typeof workoutExercise.skipReasonNote === "string" &&
      typeof workoutExercise.skipReason !== "string"
    ) {
      context.addIssue({
        code: "custom",
        message: "Must be empty when the skip reason is empty",
        path: ["skipReasonNote"],
      });
    }

    if (workoutExercise.weightType !== "none") {
      return;
    }

    for (const [
      setIndex,
      workoutExerciseSet,
    ] of workoutExercise.sets.entries()) {
      for (const [
        segmentIndex,
        workoutExerciseSetSegment,
      ] of workoutExerciseSet.segments.entries()) {
        if (typeof workoutExerciseSetSegment.weightValue === "number") {
          context.addIssue({
            code: "custom",
            message: "Must be empty when the weight type is none",
            path: ["sets", setIndex, "segments", segmentIndex, "weightValue"],
          });
        }
      }
    }
  });

const workoutSchema = z
  .object({
    endedAt: z.iso.datetime().nullable(),
    exercises: z
      .array(workoutExerciseSchema)
      .superRefine((workoutExercises, context) => {
        const workoutExerciseSets = workoutExercises.flatMap(
          (workoutExercise) => workoutExercise.sets,
        );

        checkUniqueValues({
          context,
          values: workoutExercises.map((workoutExercise) => workoutExercise.id),
        });

        checkUniqueValues({
          context,
          values: workoutExercises.map(
            (workoutExercise) => workoutExercise.position,
          ),
        });

        checkUniqueValues({
          context,
          values: workoutExerciseSets.map(
            (workoutExerciseSet) => workoutExerciseSet.id,
          ),
        });

        checkUniqueValues({
          context,
          values: workoutExerciseSets.flatMap((workoutExerciseSet) =>
            workoutExerciseSet.segments.map(
              (workoutExerciseSetSegment) => workoutExerciseSetSegment.id,
            ),
          ),
        });

        checkLinkedWarmUpExercises({
          context,
          exercises: workoutExercises,
          warmUpForExerciseIdKey: "warmUpForWorkoutExerciseId",
        });

        checkSupersetNeighbors({ context, exercises: workoutExercises });
      }),
    id: z.uuidv7(),
    routineId: z.uuidv7(),
    startedAt: z.iso.datetime(),
    version: z.int32(),
  })
  .superRefine((workout, context) => {
    if (
      typeof workout.endedAt === "string" &&
      Date.parse(workout.endedAt) < Date.parse(workout.startedAt)
    ) {
      context.addIssue({
        code: "custom",
        message: "Must not be before the start",
        path: ["endedAt"],
      });
    }
  });

export const workoutRouter = router({
  save: protectedProcedure.input(workoutSchema).mutation(({ ctx, input }) =>
    database.transaction(async (transaction) => {
      const routines = await transaction
        .select({ id: Schema.routine.id })
        .from(Schema.routine)
        .where(
          and(
            eq(Schema.routine.id, input.routineId),
            eq(Schema.routine.userId, ctx.session.user.id),
          ),
        );

      if (routines.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (typeof input.endedAt !== "string") {
        const inProgressWorkouts = await transaction
          .select({ id: Schema.workout.id })
          .from(Schema.workout)
          .where(
            and(
              eq(Schema.workout.userId, ctx.session.user.id),
              isNull(Schema.workout.endedAt),
              ne(Schema.workout.id, input.id),
            ),
          );

        if (inProgressWorkouts.length > 0) {
          throw new TRPCError({ code: "CONFLICT" });
        }
      }

      const workoutValues = {
        endedAt:
          typeof input.endedAt === "string"
            ? new Date(input.endedAt)
            : input.endedAt,
        routineId: input.routineId,
        startedAt: new Date(input.startedAt),
        version: input.version,
      };

      const savedWorkouts = await transaction
        .insert(Schema.workout)
        .values({
          ...workoutValues,
          id: input.id,
          userId: ctx.session.user.id,
        })
        .onConflictDoUpdate({
          set: { ...workoutValues, updatedAt: sql`now()` },
          setWhere: and(
            eq(Schema.workout.userId, ctx.session.user.id),
            lt(Schema.workout.version, input.version),
          ),
          target: Schema.workout.id,
        })
        .returning({ id: Schema.workout.id });

      if (savedWorkouts.length === 0) {
        const newerWorkouts = await transaction
          .select({ id: Schema.workout.id })
          .from(Schema.workout)
          .where(
            and(
              eq(Schema.workout.id, input.id),
              eq(Schema.workout.userId, ctx.session.user.id),
              gte(Schema.workout.version, input.version),
            ),
          );

        if (newerWorkouts.length > 0) {
          return;
        }

        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await transaction
        .delete(Schema.workoutExercise)
        .where(eq(Schema.workoutExercise.workoutId, input.id));

      if (input.exercises.length > 0) {
        await transaction.insert(Schema.workoutExercise).values(
          input.exercises.map((workoutExercise) => ({
            amountUnit: workoutExercise.amountUnit,
            exerciseId: workoutExercise.exerciseId,
            id: workoutExercise.id,
            note: workoutExercise.note,
            position: workoutExercise.position,
            section: workoutExercise.section,
            skipReason: workoutExercise.skipReason,
            skipReasonNote: workoutExercise.skipReasonNote,
            superset: workoutExercise.superset,
            warmUpForWorkoutExerciseId:
              workoutExercise.warmUpForWorkoutExerciseId,
            weightType: workoutExercise.weightType,
            workoutId: input.id,
          })),
        );
      }

      const workoutExerciseSets = input.exercises.flatMap((workoutExercise) =>
        workoutExercise.sets.map((workoutExerciseSet) => ({
          ...workoutExerciseSet,
          workoutExerciseId: workoutExercise.id,
        })),
      );

      if (workoutExerciseSets.length > 0) {
        await transaction.insert(Schema.workoutExerciseSet).values(
          workoutExerciseSets.map((workoutExerciseSet) => ({
            id: workoutExerciseSet.id,
            isToFailure: workoutExerciseSet.isToFailure,
            position: workoutExerciseSet.position,
            setType: workoutExerciseSet.setType,
            tempo: workoutExerciseSet.tempo,
            variation: workoutExerciseSet.variation,
            workoutExerciseId: workoutExerciseSet.workoutExerciseId,
          })),
        );
      }

      const workoutExerciseSetSegments = workoutExerciseSets.flatMap(
        (workoutExerciseSet) =>
          workoutExerciseSet.segments.map((workoutExerciseSetSegment) => ({
            ...workoutExerciseSetSegment,
            workoutExerciseSetId: workoutExerciseSet.id,
          })),
      );

      if (workoutExerciseSetSegments.length > 0) {
        await transaction
          .insert(Schema.workoutExerciseSetSegment)
          .values(workoutExerciseSetSegments);
      }
    }),
  ),
});
