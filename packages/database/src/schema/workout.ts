import {
  MAXIMUM_DROP_SET_WEIGHT_PERCENTAGE,
  MINIMUM_DROP_SET_WEIGHT_PERCENTAGE,
} from "@ankaa/core/features/routine/constants/drop-set";
import { MINIMUM_PAUSE_SECONDS } from "@ankaa/core/features/routine/constants/minimum-pause-seconds";
import { MINIMUM_REST_SECONDS } from "@ankaa/core/features/routine/constants/minimum-rest-seconds";
import { MINIMUM_SEGMENT_COUNT } from "@ankaa/core/features/routine/constants/minimum-segment-count";
import { SKIP_REASONS } from "@ankaa/core/features/workout/constants/skip-reasons";
import {
  MAXIMUM_WEIGHT,
  MINIMUM_WEIGHT,
  WEIGHT_UNITS,
} from "@ankaa/core/features/workout/constants/weight";
import {
  AMOUNT_UNITS,
  MINIMUM_AMOUNT,
} from "@ankaa/core/shared/constants/amount";
import {
  DROP_SET,
  INTENSITY_TECHNIQUES,
  REST_PAUSE_SET,
} from "@ankaa/core/shared/constants/intensity-techniques";
import { MINIMUM_POSITION } from "@ankaa/core/shared/constants/minimum-position";
import { SECTIONS } from "@ankaa/core/shared/constants/sections";
import { SET_TYPES } from "@ankaa/core/shared/constants/set-types";
import { TEMPO_PATTERN } from "@ankaa/core/shared/constants/tempo-pattern";
import { WEIGHT_TYPES } from "@ankaa/core/shared/constants/weight-types";
import { between, gte, inArray, isNull, sql } from "drizzle-orm";
import {
  boolean,
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

import { user } from "#/schema/authentication.ts";
import { exercise } from "#/schema/exercise.ts";
import { routine } from "#/schema/routine.ts";

const WEIGHT_PRECISION = 6;

const WEIGHT_SCALE = 2;

export const workout = snakeCase.table(
  "workout",
  {
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp({ withTimezone: true }),
    id: uuid().notNull(),
    routineId: uuid()
      .notNull()
      .references(() => routine.id, {
        name: "workout_routine_id_fkey",
        onDelete: "restrict",
      }),
    startedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`now()`),
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
    amountUnit: text({ enum: AMOUNT_UNITS }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
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
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`now()`),
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
    amount: integer(),
    id: uuid()
      .notNull()
      .default(sql`uuidv7()`),
    intensityTechnique: text({ enum: INTENSITY_TECHNIQUES }),
    isToFailure: boolean().notNull(),
    pauseSeconds: integer(),
    position: integer().notNull(),
    restSeconds: integer(),
    segmentCount: integer(),
    tempo: text(),
    type: text({ enum: SET_TYPES }).notNull(),
    weightPercentage: integer(),
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
      "workout_exercise_planned_set_type_check",
      inArray(table.type, SET_TYPES),
    ),
    check(
      "workout_exercise_planned_set_intensity_technique_check",
      inArray(table.intensityTechnique, INTENSITY_TECHNIQUES),
    ),
    check(
      "workout_exercise_planned_set_tempo_check",
      sql`${table.tempo} ~ ${TEMPO_PATTERN.source}`,
    ),
    check(
      "workout_exercise_planned_set_position_check",
      gte(table.position, MINIMUM_POSITION),
    ),
    check(
      "workout_exercise_planned_set_amount_check",
      gte(table.amount, MINIMUM_AMOUNT),
    ),
    check(
      "workout_exercise_planned_set_rest_seconds_check",
      gte(table.restSeconds, MINIMUM_REST_SECONDS),
    ),
    check(
      "workout_exercise_planned_set_segment_count_check",
      gte(table.segmentCount, MINIMUM_SEGMENT_COUNT),
    ),
    check(
      "workout_exercise_planned_set_weight_percentage_check",
      between(
        table.weightPercentage,
        MINIMUM_DROP_SET_WEIGHT_PERCENTAGE,
        MAXIMUM_DROP_SET_WEIGHT_PERCENTAGE,
      ),
    ),
    check(
      "workout_exercise_planned_set_pause_seconds_check",
      gte(table.pauseSeconds, MINIMUM_PAUSE_SECONDS),
    ),
    check(
      "workout_exercise_planned_set_no_intensity_technique_check",
      sql`${table.intensityTechnique} is not null or (${table.segmentCount} is null and ${table.weightPercentage} is null and ${table.pauseSeconds} is null)`,
    ),
    check(
      "workout_exercise_planned_set_drop_set_check",
      sql`${table.intensityTechnique} <> ${DROP_SET} or (${table.segmentCount} is not null and ${table.pauseSeconds} is null)`,
    ),
    check(
      "workout_exercise_planned_set_rest_pause_set_check",
      sql`${table.intensityTechnique} <> ${REST_PAUSE_SET} or (${table.segmentCount} is not null and ${table.pauseSeconds} is not null and ${table.weightPercentage} is null)`,
    ),
  ],
);

export const workoutExerciseRecordedSet = snakeCase.table(
  "workout_exercise_recorded_set",
  {
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    id: uuid().notNull(),
    position: integer().notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`now()`),
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
