import { database } from "@ankaa/database";
import {
  AMOUNT_MINIMUM,
  DAYS_OF_WEEK,
  DROP_SET_WEIGHT_PERCENTAGE_MAXIMUM,
  DROP_SET_WEIGHT_PERCENTAGE_MINIMUM,
  POSITION_MINIMUM,
  REST_SECONDS_MINIMUM,
  SECTIONS,
  SEGMENT_COUNT_MINIMUM,
  SET_TYPES,
  TEMPO_PATTERN,
  VARIATIONS,
} from "@ankaa/database/constants";
import { and, eq, isNull, ne, sql } from "@ankaa/database/operators";
import * as Schema from "@ankaa/database/schema";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, router } from "../trpc.ts";

type CheckUniqueValuesOptions = {
  context: z.RefinementCtx;
  values: unknown[];
};

const nowSql = sql`now()`;

const routineExerciseSetSchema = z
  .object({
    amount: z.int32().min(AMOUNT_MINIMUM).nullable(),
    dropSetSegmentCount: z.int32().min(SEGMENT_COUNT_MINIMUM).nullable(),
    dropSetWeightPercentage: z
      .int32()
      .min(DROP_SET_WEIGHT_PERCENTAGE_MINIMUM)
      .max(DROP_SET_WEIGHT_PERCENTAGE_MAXIMUM)
      .nullable(),
    id: z.uuidv7(),
    isToFailure: z.boolean(),
    position: z.int32().min(POSITION_MINIMUM),
    restPauseRestSeconds: z.int32().min(REST_SECONDS_MINIMUM).nullable(),
    restPauseSegmentCount: z.int32().min(SEGMENT_COUNT_MINIMUM).nullable(),
    restSeconds: z.int32().min(REST_SECONDS_MINIMUM).nullable(),
    setType: z.enum(SET_TYPES),
    tempo: z.string().regex(TEMPO_PATTERN).nullable(),
    variation: z.enum(VARIATIONS).nullable(),
  })
  .superRefine((routineExerciseSet, context) => {
    const isRestPause = routineExerciseSet.variation === "rest_pause";
    const isDropSet = routineExerciseSet.variation === "drop_set";

    for (const restPauseKey of [
      "restPauseRestSeconds",
      "restPauseSegmentCount",
    ] as const) {
      if (
        (typeof routineExerciseSet[restPauseKey] === "number") !==
        isRestPause
      ) {
        context.addIssue({
          code: "custom",
          message: "Must be filled exactly when the variation is rest_pause",
          path: [restPauseKey],
        });
      }
    }

    if (
      (typeof routineExerciseSet.dropSetSegmentCount === "number") !==
      isDropSet
    ) {
      context.addIssue({
        code: "custom",
        message: "Must be filled exactly when the variation is drop_set",
        path: ["dropSetSegmentCount"],
      });
    }

    if (
      typeof routineExerciseSet.dropSetWeightPercentage === "number" &&
      !isDropSet
    ) {
      context.addIssue({
        code: "custom",
        message: "Must be empty unless the variation is drop_set",
        path: ["dropSetWeightPercentage"],
      });
    }
  });

const routineExerciseSchema = z.object({
  exerciseId: z.uuidv7(),
  id: z.uuidv7(),
  note: z.string().nullable(),
  position: z.int32().min(POSITION_MINIMUM),
  section: z.enum(SECTIONS),
  sets: z
    .array(routineExerciseSetSchema)
    .superRefine((routineExerciseSets, context) => {
      checkUniqueValues({
        context,
        values: routineExerciseSets.map(
          (routineExerciseSet) => routineExerciseSet.position,
        ),
      });
    }),
  superset: z.int32().nullable(),
  warmUpForRoutineExerciseId: z.uuidv7().nullable(),
});

const routineSchema = z.object({
  days: z.array(z.enum(DAYS_OF_WEEK)).superRefine((days, context) => {
    checkUniqueValues({ context, values: days });
  }),
  exercises: z
    .array(routineExerciseSchema)
    .superRefine((routineExercises, context) => {
      checkUniqueValues({
        context,
        values: routineExercises.map((routineExercise) => routineExercise.id),
      });

      checkUniqueValues({
        context,
        values: routineExercises.map(
          (routineExercise) => routineExercise.position,
        ),
      });

      checkUniqueValues({
        context,
        values: routineExercises.flatMap((routineExercise) =>
          routineExercise.sets.map(
            (routineExerciseSet) => routineExerciseSet.id,
          ),
        ),
      });

      for (const [index, routineExercise] of routineExercises.entries()) {
        const warmUpForRoutineExercise = routineExercises.find(
          (linkedRoutineExercise) =>
            linkedRoutineExercise.id ===
            routineExercise.warmUpForRoutineExerciseId,
        );

        if (
          typeof routineExercise.warmUpForRoutineExerciseId === "string" &&
          (warmUpForRoutineExercise?.section !== "main" ||
            warmUpForRoutineExercise.id === routineExercise.id)
        ) {
          context.addIssue({
            code: "custom",
            message: "Must point to another main exercise of the same routine",
            path: [index, "warmUpForRoutineExerciseId"],
          });
        }
      }

      const sortedRoutineExercises = routineExercises.toSorted(
        (firstRoutineExercise, secondRoutineExercise) =>
          firstRoutineExercise.position - secondRoutineExercise.position,
      );

      for (const [index, routineExercise] of sortedRoutineExercises.entries()) {
        const isSupersetContinued =
          typeof routineExercise.superset !== "number" ||
          routineExercise.superset ===
            sortedRoutineExercises[index - 1]?.superset;
        const isSupersetStartedEarlier = sortedRoutineExercises
          .slice(0, index)
          .some(
            (earlierRoutineExercise) =>
              earlierRoutineExercise.superset === routineExercise.superset,
          );

        if (!isSupersetContinued && isSupersetStartedEarlier) {
          context.addIssue({
            code: "custom",
            message: "The exercises of a superset must be neighbors",
          });
        }
      }
    }),
  id: z.uuidv7(),
  name: z.string().trim().nonempty(),
});

export const routineRouter = router({
  delete: protectedProcedure
    .input(z.object({ id: z.uuidv7() }))
    .mutation(async ({ ctx, input }) => {
      const deletedRoutines = await database
        .update(Schema.routine)
        .set({ deletedAt: nowSql })
        .where(
          and(
            eq(Schema.routine.id, input.id),
            eq(Schema.routine.userId, ctx.session.user.id),
            isNull(Schema.routine.deletedAt),
          ),
        )
        .returning({ id: Schema.routine.id });

      if (deletedRoutines.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
    }),
  list: protectedProcedure.query(async ({ ctx }) => {
    const routines = await database.query.routine.findMany({
      columns: { id: true, name: true },
      orderBy: { name: "asc" },
      where: { deletedAt: { isNull: true }, userId: ctx.session.user.id },
      with: {
        routineDays: { columns: { dayOfWeek: true } },
        routineExercises: {
          columns: {
            exerciseId: true,
            id: true,
            note: true,
            position: true,
            section: true,
            superset: true,
            warmUpForRoutineExerciseId: true,
          },
          orderBy: { position: "asc" },
          with: {
            routineExerciseSets: {
              columns: {
                amount: true,
                dropSetSegmentCount: true,
                dropSetWeightPercentage: true,
                id: true,
                isToFailure: true,
                position: true,
                restPauseRestSeconds: true,
                restPauseSegmentCount: true,
                restSeconds: true,
                setType: true,
                tempo: true,
                variation: true,
              },
              orderBy: { position: "asc" },
            },
          },
        },
      },
    });

    return routines.map((routine) => ({
      days: routine.routineDays
        .map((routineDay) => routineDay.dayOfWeek)
        .toSorted(
          (firstDayOfWeek, secondDayOfWeek) =>
            DAYS_OF_WEEK.indexOf(firstDayOfWeek) -
            DAYS_OF_WEEK.indexOf(secondDayOfWeek),
        ),
      exercises: routine.routineExercises.map(
        ({ routineExerciseSets, ...routineExercise }) => ({
          ...routineExercise,
          sets: routineExerciseSets,
        }),
      ),
      id: routine.id,
      name: routine.name,
    }));
  }),
  save: protectedProcedure.input(routineSchema).mutation(({ ctx, input }) =>
    database.transaction(async (transaction) => {
      const routinesWithSameName = await transaction
        .select({ id: Schema.routine.id })
        .from(Schema.routine)
        .where(
          and(
            eq(Schema.routine.userId, ctx.session.user.id),
            eq(Schema.routine.name, input.name),
            isNull(Schema.routine.deletedAt),
            ne(Schema.routine.id, input.id),
          ),
        );

      if (routinesWithSameName.length > 0) {
        throw new TRPCError({ code: "CONFLICT" });
      }

      const savedRoutines = await transaction
        .insert(Schema.routine)
        .values({
          id: input.id,
          name: input.name,
          userId: ctx.session.user.id,
        })
        .onConflictDoUpdate({
          set: { name: input.name, updatedAt: nowSql },
          setWhere: and(
            eq(Schema.routine.userId, ctx.session.user.id),
            isNull(Schema.routine.deletedAt),
          ),
          target: Schema.routine.id,
        })
        .returning({ id: Schema.routine.id });

      if (savedRoutines.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await transaction
        .delete(Schema.routineDay)
        .where(eq(Schema.routineDay.routineId, input.id));

      await transaction
        .delete(Schema.routineExercise)
        .where(eq(Schema.routineExercise.routineId, input.id));

      if (input.days.length > 0) {
        await transaction.insert(Schema.routineDay).values(
          input.days.map((dayOfWeek) => ({
            dayOfWeek,
            routineId: input.id,
          })),
        );
      }

      if (input.exercises.length > 0) {
        await transaction.insert(Schema.routineExercise).values(
          input.exercises.map((routineExercise) => ({
            exerciseId: routineExercise.exerciseId,
            id: routineExercise.id,
            note: routineExercise.note,
            position: routineExercise.position,
            routineId: input.id,
            section: routineExercise.section,
            superset: routineExercise.superset,
            warmUpForRoutineExerciseId:
              routineExercise.warmUpForRoutineExerciseId,
          })),
        );
      }

      const routineExerciseSets = input.exercises.flatMap((routineExercise) =>
        routineExercise.sets.map((routineExerciseSet) => ({
          ...routineExerciseSet,
          routineExerciseId: routineExercise.id,
        })),
      );

      if (routineExerciseSets.length > 0) {
        await transaction
          .insert(Schema.routineExerciseSet)
          .values(routineExerciseSets);
      }
    }),
  ),
});

function checkUniqueValues({ context, values }: CheckUniqueValuesOptions) {
  if (new Set(values).size !== values.length) {
    context.addIssue({ code: "custom", message: "Must be unique" });
  }
}
