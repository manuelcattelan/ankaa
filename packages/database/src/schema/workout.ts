import {} from "@ankaa/core/features/routine/constants/drop-set";
import { SKIP_REASONS } from "@ankaa/core/features/workout/constants/skip-reasons";
import {
  MAXIMUM_WEIGHT,
  MINIMUM_WEIGHT,
  WEIGHT_PRECISION,
  WEIGHT_SCALE,
  WEIGHT_UNITS,
} from "@ankaa/core/features/workout/constants/weight";
import {
  AMOUNT_UNITS,
  MINIMUM_AMOUNT,
} from "@ankaa/core/shared/constants/amount";
import {} from "@ankaa/core/shared/constants/intensity-techniques";
import { MINIMUM_POSITION } from "@ankaa/core/shared/constants/minimum-position";
import { SECTIONS } from "@ankaa/core/shared/constants/sections";
import { WEIGHT_TYPES } from "@ankaa/core/shared/constants/weight-types";
import { between, gte, inArray, isNull, sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  integer,
  numeric,
  primaryKey,
  snakeCase,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { buildPlannedSetChecks } from "#/columns/build-planned-set-checks.ts";
import { plannedSetColumns } from "#/columns/planned-set-columns.ts";
import { timestamps } from "#/columns/timestamps.ts";
import { user } from "#/schema/authentication.ts";
import { exercise } from "#/schema/exercise.ts";
import { routine } from "#/schema/routine.ts";

export const workout = snakeCase.table(
  "workout",
  {
    ...timestamps,
    endedAt: timestamp({ withTimezone: true }),
    id: uuid().notNull(),
    routineId: uuid()
      .notNull()
      .references(() => routine.id, {
        name: "workout_routine_id_fkey",
        onDelete: "restrict",
      }),
    startedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    userId: uuid()
      .notNull()
      .references(() => user.id, {
        name: "workout_user_id_fkey",
        onDelete: "cascade",
      }),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "workout_pkey" }),
    uniqueIndex("workout_in_progress_idx")
      .on(table.userId)
      .where(isNull(table.endedAt)),
    index("workout_user_id_idx").on(table.userId),
    index("workout_routine_id_idx").on(table.routineId),
  ],
);

export const workoutExerciseGroup = snakeCase.table(
  "workout_exercise_group",
  {
    id: uuid()
      .notNull()
      .default(sql`uuidv7()`),
    position: integer().notNull(),
    section: text({ enum: SECTIONS }).notNull(),
    workoutId: uuid()
      .notNull()
      .references(() => workout.id, {
        name: "workout_exercise_group_workout_id_fkey",
        onDelete: "cascade",
      }),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "workout_exercise_group_pkey" }),
    unique("workout_exercise_group_workout_id_section_position_key").on(
      table.workoutId,
      table.section,
      table.position,
    ),
    check(
      "workout_exercise_group_section_check",
      inArray(table.section, SECTIONS),
    ),
    check(
      "workout_exercise_group_position_check",
      gte(table.position, MINIMUM_POSITION),
    ),
  ],
);

export const workoutExercise = snakeCase.table(
  "workout_exercise",
  {
    ...timestamps,
    amountUnit: text({ enum: AMOUNT_UNITS }).notNull(),
    exerciseId: uuid()
      .notNull()
      .references(() => exercise.id, {
        name: "workout_exercise_exercise_id_fkey",
        onDelete: "restrict",
      }),
    id: uuid()
      .notNull()
      .default(sql`uuidv7()`),
    note: text(),
    plannedNote: text(),
    position: integer().notNull(),
    skipNote: text(),
    skipReason: text({ enum: SKIP_REASONS }),
    warmUpForWorkoutExerciseId: uuid(),
    weightType: text({ enum: WEIGHT_TYPES }).notNull(),
    weightUnit: text({ enum: WEIGHT_UNITS }).notNull().default("kilogram"),
    workoutExerciseGroupId: uuid().references(() => workoutExerciseGroup.id, {
      name: "workout_exercise_workout_exercise_group_id_fkey",
      onDelete: "cascade",
    }),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "workout_exercise_pkey" }),
    foreignKey({
      columns: [table.warmUpForWorkoutExerciseId],
      foreignColumns: [table.id],
      name: "workout_exercise_warm_up_for_workout_exercise_id_fkey",
    }).onDelete("cascade"),
    unique("workout_exercise_workout_exercise_group_id_position_key").on(
      table.workoutExerciseGroupId,
      table.position,
    ),
    unique("workout_exercise_warm_up_for_workout_exercise_id_position_key").on(
      table.warmUpForWorkoutExerciseId,
      table.position,
    ),
    index("workout_exercise_exercise_id_idx").on(table.exerciseId),
    check(
      "workout_exercise_amount_unit_check",
      inArray(table.amountUnit, AMOUNT_UNITS),
    ),
    check(
      "workout_exercise_weight_type_check",
      inArray(table.weightType, WEIGHT_TYPES),
    ),
    check(
      "workout_exercise_weight_unit_check",
      inArray(table.weightUnit, WEIGHT_UNITS),
    ),
    check(
      "workout_exercise_skip_reason_check",
      inArray(table.skipReason, SKIP_REASONS),
    ),
    check(
      "workout_exercise_position_check",
      gte(table.position, MINIMUM_POSITION),
    ),
    check(
      "workout_exercise_skip_check",
      sql`${table.skipReason} is not null or ${table.skipNote} is null`,
    ),
    check(
      "workout_exercise_parent_check",
      sql`num_nonnulls(${table.workoutExerciseGroupId}, ${table.warmUpForWorkoutExerciseId}) = 1`,
    ),
  ],
);

export const workoutExercisePlannedSet = snakeCase.table(
  "workout_exercise_planned_set",
  {
    ...plannedSetColumns,
    id: uuid()
      .notNull()
      .default(sql`uuidv7()`),
    position: integer().notNull(),
    workoutExerciseId: uuid()
      .notNull()
      .references(() => workoutExercise.id, {
        name: "workout_exercise_planned_set_workout_exercise_id_fkey",
        onDelete: "cascade",
      }),
  },
  (table) => [
    primaryKey({
      columns: [table.id],
      name: "workout_exercise_planned_set_pkey",
    }),
    unique("workout_exercise_planned_set_workout_exercise_id_position_key").on(
      table.workoutExerciseId,
      table.position,
    ),
    check(
      "workout_exercise_planned_set_position_check",
      gte(table.position, MINIMUM_POSITION),
    ),
    ...buildPlannedSetChecks({ name: "workout_exercise_planned_set", table }),
  ],
);

export const workoutExerciseRecordedSet = snakeCase.table(
  "workout_exercise_recorded_set",
  {
    ...timestamps,
    id: uuid().notNull(),
    position: integer().notNull(),
    workoutExerciseId: uuid()
      .notNull()
      .references(() => workoutExercise.id, {
        name: "workout_exercise_recorded_set_workout_exercise_id_fkey",
        onDelete: "cascade",
      }),
  },
  (table) => [
    primaryKey({
      columns: [table.id],
      name: "workout_exercise_recorded_set_pkey",
    }),
    unique("workout_exercise_recorded_set_workout_exercise_id_position_key").on(
      table.workoutExerciseId,
      table.position,
    ),
    check(
      "workout_exercise_recorded_set_position_check",
      gte(table.position, MINIMUM_POSITION),
    ),
  ],
);

export const workoutExerciseRecordedSetSegment = snakeCase.table(
  "workout_exercise_recorded_set_segment",
  {
    amount: integer().notNull(),
    position: integer().notNull(),
    weight: numeric({
      mode: "number",
      precision: WEIGHT_PRECISION,
      scale: WEIGHT_SCALE,
    }),
    workoutExerciseRecordedSetId: uuid()
      .notNull()
      .references(() => workoutExerciseRecordedSet.id, {
        name: "workout_exercise_recorded_set_segment_recorded_set_id_fkey",
        onDelete: "cascade",
      }),
  },
  (table) => [
    primaryKey({
      columns: [table.workoutExerciseRecordedSetId, table.position],
      name: "workout_exercise_recorded_set_segment_pkey",
    }),
    check(
      "workout_exercise_recorded_set_segment_position_check",
      gte(table.position, MINIMUM_POSITION),
    ),
    check(
      "workout_exercise_recorded_set_segment_amount_check",
      gte(table.amount, MINIMUM_AMOUNT),
    ),
    check(
      "workout_exercise_recorded_set_segment_weight_check",
      between(table.weight, MINIMUM_WEIGHT, MAXIMUM_WEIGHT),
    ),
  ],
);
