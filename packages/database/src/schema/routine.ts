import { DAYS_OF_WEEK } from "@ankaa/core/features/routine/constants/days-of-week";
import {
  MAXIMUM_DROP_SET_WEIGHT_PERCENTAGE,
  MINIMUM_DROP_SET_WEIGHT_PERCENTAGE,
} from "@ankaa/core/features/routine/constants/drop-set";
import { MINIMUM_PAUSE_SECONDS } from "@ankaa/core/features/routine/constants/minimum-pause-seconds";
import { MINIMUM_REST_SECONDS } from "@ankaa/core/features/routine/constants/minimum-rest-seconds";
import { MINIMUM_SEGMENT_COUNT } from "@ankaa/core/features/routine/constants/minimum-segment-count";
import { MINIMUM_AMOUNT } from "@ankaa/core/shared/constants/amount";
import { INTENSITY_TECHNIQUES } from "@ankaa/core/shared/constants/intensity-techniques";
import { MINIMUM_POSITION } from "@ankaa/core/shared/constants/minimum-position";
import { SECTIONS } from "@ankaa/core/shared/constants/sections";
import { SET_TYPES } from "@ankaa/core/shared/constants/set-types";
import { TEMPO_PATTERN } from "@ankaa/core/shared/constants/tempo-pattern";
import { between, gte, inArray, isNull, sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
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

export const routine = snakeCase.table(
  "routine",
  {
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp({ withTimezone: true }),
    id: uuid().primaryKey(),
    name: text().notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`now()`),
    userId: uuid()
      .notNull()
      .references(() => user.id, {
        name: "routine_user_id_fkey",
        onDelete: "cascade",
      }),
  },
  (table) => [
    uniqueIndex("routine_user_id_name_idx")
      .on(table.userId, sql`lower(${table.name})`)
      .where(isNull(table.deletedAt)),
    index("routine_user_id_idx").on(table.userId),
    check("routine_name_check", sql`${table.name} <> ''`),
  ],
);

export const routineDay = snakeCase.table(
  "routine_day",
  {
    dayOfWeek: text({ enum: DAYS_OF_WEEK }).notNull(),
    routineId: uuid()
      .notNull()
      .references(() => routine.id, {
        name: "routine_day_routine_id_fkey",
        onDelete: "cascade",
      }),
  },
  (table) => [
    primaryKey({
      columns: [table.routineId, table.dayOfWeek],
      name: "routine_day_pkey",
    }),
    check(
      "routine_day_day_of_week_check",
      inArray(table.dayOfWeek, DAYS_OF_WEEK),
    ),
  ],
);

export const routineExerciseGroup = snakeCase.table(
  "routine_exercise_group",
  {
    id: uuid().primaryKey(),
    position: integer().notNull(),
    routineId: uuid()
      .notNull()
      .references(() => routine.id, {
        name: "routine_exercise_group_routine_id_fkey",
        onDelete: "cascade",
      }),
    section: text({ enum: SECTIONS }).notNull(),
  },
  (table) => [
    unique("routine_exercise_group_routine_id_section_position_key").on(
      table.routineId,
      table.section,
      table.position,
    ),
    check(
      "routine_exercise_group_section_check",
      inArray(table.section, SECTIONS),
    ),
    check(
      "routine_exercise_group_position_check",
      gte(table.position, MINIMUM_POSITION),
    ),
  ],
);

export const routineExercise = snakeCase.table(
  "routine_exercise",
  {
    exerciseId: uuid()
      .notNull()
      .references(() => exercise.id, {
        name: "routine_exercise_exercise_id_fkey",
        onDelete: "restrict",
      }),
    id: uuid().primaryKey(),
    note: text(),
    position: integer().notNull(),
    routineExerciseGroupId: uuid().references(() => routineExerciseGroup.id, {
      name: "routine_exercise_routine_exercise_group_id_fkey",
      onDelete: "cascade",
    }),
    warmUpForRoutineExerciseId: uuid(),
  },
  (table) => [
    foreignKey({
      columns: [table.warmUpForRoutineExerciseId],
      foreignColumns: [table.id],
      name: "routine_exercise_warm_up_for_routine_exercise_id_fkey",
    }).onDelete("cascade"),
    unique("routine_exercise_routine_exercise_group_id_position_key").on(
      table.routineExerciseGroupId,
      table.position,
    ),
    unique("routine_exercise_warm_up_for_routine_exercise_id_position_key").on(
      table.warmUpForRoutineExerciseId,
      table.position,
    ),
    index("routine_exercise_exercise_id_idx").on(table.exerciseId),
    check(
      "routine_exercise_position_check",
      gte(table.position, MINIMUM_POSITION),
    ),
    check(
      "routine_exercise_parent_check",
      sql`num_nonnulls(${table.routineExerciseGroupId}, ${table.warmUpForRoutineExerciseId}) = 1`,
    ),
  ],
);

export const routineExerciseSet = snakeCase.table(
  "routine_exercise_set",
  {
    amount: integer(),
    id: uuid().primaryKey(),
    intensityTechnique: text({ enum: INTENSITY_TECHNIQUES }),
    isToFailure: boolean().notNull(),
    pauseSeconds: integer(),
    position: integer().notNull(),
    restSeconds: integer(),
    routineExerciseId: uuid()
      .notNull()
      .references(() => routineExercise.id, {
        name: "routine_exercise_set_routine_exercise_id_fkey",
        onDelete: "cascade",
      }),
    segmentCount: integer(),
    tempo: text(),
    type: text({ enum: SET_TYPES }).notNull(),
    weightPercentage: integer(),
  },
  (table) => [
    unique("routine_exercise_set_routine_exercise_id_position_key").on(
      table.routineExerciseId,
      table.position,
    ),
    check("routine_exercise_set_type_check", inArray(table.type, SET_TYPES)),
    check(
      "routine_exercise_set_intensity_technique_check",
      inArray(table.intensityTechnique, INTENSITY_TECHNIQUES),
    ),
    check(
      "routine_exercise_set_tempo_check",
      sql`${table.tempo} ~ ${TEMPO_PATTERN.source}`,
    ),
    check(
      "routine_exercise_set_position_check",
      gte(table.position, MINIMUM_POSITION),
    ),
    check(
      "routine_exercise_set_amount_check",
      gte(table.amount, MINIMUM_AMOUNT),
    ),
    check(
      "routine_exercise_set_rest_seconds_check",
      gte(table.restSeconds, MINIMUM_REST_SECONDS),
    ),
    check(
      "routine_exercise_set_segment_count_check",
      gte(table.segmentCount, MINIMUM_SEGMENT_COUNT),
    ),
    check(
      "routine_exercise_set_weight_percentage_check",
      between(
        table.weightPercentage,
        MINIMUM_DROP_SET_WEIGHT_PERCENTAGE,
        MAXIMUM_DROP_SET_WEIGHT_PERCENTAGE,
      ),
    ),
    check(
      "routine_exercise_set_pause_seconds_check",
      gte(table.pauseSeconds, MINIMUM_PAUSE_SECONDS),
    ),
    check(
      "routine_exercise_set_no_intensity_technique_check",
      sql`${table.intensityTechnique} is not null or (${table.segmentCount} is null and ${table.weightPercentage} is null and ${table.pauseSeconds} is null)`,
    ),
    check(
      "routine_exercise_set_drop_set_check",
      sql`${table.intensityTechnique} <> 'drop_set' or (${table.segmentCount} is not null and ${table.pauseSeconds} is null)`,
    ),
    check(
      "routine_exercise_set_rest_pause_set_check",
      sql`${table.intensityTechnique} <> 'rest_pause_set' or (${table.segmentCount} is not null and ${table.pauseSeconds} is not null and ${table.weightPercentage} is null)`,
    ),
  ],
);
