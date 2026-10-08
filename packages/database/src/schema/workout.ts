import { defineRelationsPart, gte, inArray, isNull, sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  numeric,
  snakeCase,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

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
  WEIGHT_VALUE_MINIMUM,
} from "../constants.ts";
import { user } from "./authentication.ts";
import { commonColumns } from "./common-columns.ts";
import { exercise } from "./exercise.ts";
import { routine } from "./routine.ts";

const WEIGHT_VALUE_PRECISION = 6;

const WEIGHT_VALUE_SCALE = 2;

export const workout = snakeCase.table(
  "workout",
  {
    ...commonColumns,
    endedAt: timestamp({ withTimezone: true }),
    routineId: uuid()
      .notNull()
      .references(() => routine.id, {
        name: "workout_routine_id_fkey",
        onDelete: "restrict",
      }),
    startedAt: timestamp({ withTimezone: true }).notNull(),
    userId: text()
      .notNull()
      .references(() => user.id, {
        name: "workout_user_id_fkey",
        onDelete: "cascade",
      }),
    version: integer().notNull(),
  },
  (table) => [
    uniqueIndex("workout_in_progress_idx")
      .on(table.userId)
      .where(isNull(table.endedAt)),
    index("workout_user_id_idx").on(table.userId),
    index("workout_routine_id_idx").on(table.routineId),
  ],
);

export const workoutExercise = snakeCase.table(
  "workout_exercise",
  {
    ...commonColumns,
    amountUnit: text({ enum: AMOUNT_UNITS }).notNull(),
    exerciseId: uuid()
      .notNull()
      .references(() => exercise.id, {
        name: "workout_exercise_exercise_id_fkey",
        onDelete: "restrict",
      }),
    note: text(),
    position: integer().notNull(),
    section: text({ enum: SECTIONS }).notNull(),
    skipReason: text({ enum: SKIP_REASONS }),
    skipReasonNote: text(),
    superset: integer(),
    warmUpForWorkoutExerciseId: uuid(),
    weightType: text({ enum: WEIGHT_TYPES }).notNull(),
    workoutId: uuid()
      .notNull()
      .references(() => workout.id, {
        name: "workout_exercise_workout_id_fkey",
        onDelete: "cascade",
      }),
  },
  (table) => [
    foreignKey({
      columns: [table.warmUpForWorkoutExerciseId],
      foreignColumns: [table.id],
      name: "workout_exercise_warm_up_for_workout_exercise_id_fkey",
    }).onDelete("cascade"),
    unique("workout_exercise_workout_id_position_key").on(
      table.workoutId,
      table.position,
    ),
    index("workout_exercise_exercise_id_idx").on(table.exerciseId),
    index("workout_exercise_warm_up_for_workout_exercise_id_idx").on(
      table.warmUpForWorkoutExerciseId,
    ),
    check(
      "workout_exercise_amount_unit_check",
      inArray(table.amountUnit, AMOUNT_UNITS),
    ),
    check(
      "workout_exercise_weight_type_check",
      inArray(table.weightType, WEIGHT_TYPES),
    ),
    check("workout_exercise_section_check", inArray(table.section, SECTIONS)),
    check(
      "workout_exercise_skip_reason_check",
      inArray(table.skipReason, SKIP_REASONS),
    ),
    check(
      "workout_exercise_position_check",
      gte(table.position, POSITION_MINIMUM),
    ),
    check(
      "workout_exercise_skip_check",
      sql`${table.skipReason} is not null or ${table.skipReasonNote} is null`,
    ),
  ],
);

export const workoutExerciseSet = snakeCase.table(
  "workout_exercise_set",
  {
    ...commonColumns,
    isToFailure: boolean().notNull(),
    position: integer().notNull(),
    setType: text({ enum: SET_TYPES }).notNull(),
    tempo: text(),
    variation: text({ enum: VARIATIONS }),
    workoutExerciseId: uuid()
      .notNull()
      .references(() => workoutExercise.id, {
        name: "workout_exercise_set_workout_exercise_id_fkey",
        onDelete: "cascade",
      }),
  },
  (table) => [
    unique("workout_exercise_set_workout_exercise_id_position_key").on(
      table.workoutExerciseId,
      table.position,
    ),
    check(
      "workout_exercise_set_set_type_check",
      inArray(table.setType, SET_TYPES),
    ),
    check(
      "workout_exercise_set_variation_check",
      inArray(table.variation, VARIATIONS),
    ),
    check(
      "workout_exercise_set_tempo_check",
      sql`${table.tempo} ~ ${TEMPO_PATTERN.source}`,
    ),
    check(
      "workout_exercise_set_position_check",
      gte(table.position, POSITION_MINIMUM),
    ),
  ],
);

export const workoutExerciseSetSegment = snakeCase.table(
  "workout_exercise_set_segment",
  {
    ...commonColumns,
    amount: integer(),
    position: integer().notNull(),
    weightUnit: text({ enum: WEIGHT_UNITS }),
    weightValue: numeric({
      mode: "number",
      precision: WEIGHT_VALUE_PRECISION,
      scale: WEIGHT_VALUE_SCALE,
    }),
    workoutExerciseSetId: uuid()
      .notNull()
      .references(() => workoutExerciseSet.id, {
        name: "workout_exercise_set_segment_workout_exercise_set_id_fkey",
        onDelete: "cascade",
      }),
  },
  (table) => [
    unique("workout_exercise_set_segment_position_key").on(
      table.workoutExerciseSetId,
      table.position,
    ),
    check(
      "workout_exercise_set_segment_weight_unit_check",
      inArray(table.weightUnit, WEIGHT_UNITS),
    ),
    check(
      "workout_exercise_set_segment_position_check",
      gte(table.position, POSITION_MINIMUM),
    ),
    check(
      "workout_exercise_set_segment_amount_check",
      gte(table.amount, AMOUNT_MINIMUM),
    ),
    check(
      "workout_exercise_set_segment_weight_value_check",
      gte(table.weightValue, WEIGHT_VALUE_MINIMUM),
    ),
    check(
      "workout_exercise_set_segment_weight_check",
      sql`${table.weightValue} is null or ${table.weightUnit} is not null`,
    ),
  ],
);

export const workoutRelations = defineRelationsPart(
  {
    workout,
    workoutExercise,
    workoutExerciseSet,
    workoutExerciseSetSegment,
  },
  (r) => ({
    workout: {
      workoutExercises: r.many.workoutExercise({
        from: r.workout.id,
        to: r.workoutExercise.workoutId,
      }),
    },
    workoutExercise: {
      workout: r.one.workout({
        from: r.workoutExercise.workoutId,
        optional: false,
        to: r.workout.id,
      }),
      workoutExerciseSets: r.many.workoutExerciseSet({
        from: r.workoutExercise.id,
        to: r.workoutExerciseSet.workoutExerciseId,
      }),
    },
    workoutExerciseSet: {
      workoutExercise: r.one.workoutExercise({
        from: r.workoutExerciseSet.workoutExerciseId,
        optional: false,
        to: r.workoutExercise.id,
      }),
      workoutExerciseSetSegments: r.many.workoutExerciseSetSegment({
        from: r.workoutExerciseSet.id,
        to: r.workoutExerciseSetSegment.workoutExerciseSetId,
      }),
    },
    workoutExerciseSetSegment: {
      workoutExerciseSet: r.one.workoutExerciseSet({
        from: r.workoutExerciseSetSegment.workoutExerciseSetId,
        optional: false,
        to: r.workoutExerciseSet.id,
      }),
    },
  }),
);
